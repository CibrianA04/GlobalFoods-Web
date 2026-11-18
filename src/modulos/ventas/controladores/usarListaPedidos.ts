import { computed, ref, shallowRef, watch } from 'vue'

import { estadoDePedido, type EstadoPantalla } from '@/modulos/ventas/controladores/estadosPedido'
import { normalizarTexto } from '@/modulos/ventas/controladores/formatosPedido'
import { leerObservaciones, type ObservacionesPedido } from '@/modulos/ventas/controladores/observacionesPedido'
import { usarDirectorioPedidos } from '@/modulos/ventas/controladores/usarDirectorioPedidos'
import type { Pedido } from '@/modulos/ventas/interfaces/pedido'
import { ErrorPedidos, obtenerPedidos } from '@/modulos/ventas/servicios/servicioPedidos'

export const PEDIDOS_POR_PAGINA = 10

export const MENSAJES_LISTA = {
  cargando: 'Cargando pedidos…',
  errorCarga: 'No fue posible cargar los pedidos. Intente nuevamente.',
  sinResultados: 'No hay pedidos con esos filtros.',
  sinPedidos: 'Todavía no hay pedidos registrados.',
  rangoFechas: 'La fecha inicial debe ser anterior a la fecha final.',
}

export const IDS_LISTA = {
  buscar: 'pedidos-buscar',
  desde: 'pedidos-desde',
  hasta: 'pedidos-hasta',
  anterior: 'pedidos-pagina-anterior',
  siguiente: 'pedidos-pagina-siguiente',
}

/** Pedidos por estatus, con la búsqueda y las fechas ya aplicadas (el filtro de estado no). */
export interface ConteosPedidos {
  /** Incluye los de estatus desconocido, que no tienen píldora propia. */
  todos: number
  porEstatus: Record<number, number>
}

/** Renglón de la tabla, ya resuelto para pintarlo. */
export interface FilaPedido {
  id: number
  cliente: string
  /** "Sucursal Las Quintas"; "Sucursal #3" si no se encontró; "Sucursal …" mientras se consulta. */
  sucursal: string
  /** aaaa-mm-dd */
  registrado: string
  entrega: ObservacionesPedido
  estado: EstadoPantalla
  total: number
  totalKg: number
}

/**
 * Estado de la lista de pedidos: carga, filtros (estado, búsqueda por folio o cliente y rango de
 * la fecha de registro) y páginas de 10, todo en la web. Si la API responde 401, llama a
 * `alVencerSesion` para que la vista mande a inicio de sesión.
 */
export function usarListaPedidos(opciones: { alVencerSesion: () => void }) {
  const pedidos = shallowRef<Pedido[]>([])
  const cargando = ref(true)
  const errorCarga = ref(false)
  const directorio = usarDirectorioPedidos()
  // Cada carga lleva un número; si llega la respuesta de una vieja (p. ej. doble Reintentar), se descarta.
  let cargaVigente = 0

  // Filtros
  /** null = Todos. */
  const estatus = ref<number | null>(null)
  const criterio = ref('')
  /** aaaa-mm-dd */
  const desde = ref('')
  const hasta = ref('')
  const pagina = ref(1)

  /** Con nombre de cliente, estado y datos de entrega; del más reciente al más antiguo. */
  const pedidosResueltos = computed(() =>
    pedidos.value.map((pedido) => {
      const cliente = directorio.nombreCliente(pedido.idCliente)
      return {
        pedido,
        cliente,
        clienteNormalizado: normalizarTexto(cliente),
        estado: estadoDePedido(pedido.estatus),
        entrega: leerObservaciones(pedido.observaciones),
      }
    }),
  )

  const errorFechas = computed(() =>
    desde.value && hasta.value && desde.value > hasta.value ? MENSAJES_LISTA.rangoFechas : '',
  )

  /** Con búsqueda y fechas aplicadas; sobre ellos se cuentan las píldoras de estado. */
  const porBusquedaYFechas = computed(() => {
    const texto = normalizarTexto(criterio.value)
    const folio = texto.replace(/^#/, '')
    const buscaFolio = /^\d+$/.test(folio)
    // Con el rango al revés no se filtra por fecha; el campo Desde muestra el error.
    const aplicaFechas = !errorFechas.value

    return pedidosResueltos.value.filter(({ pedido, clienteNormalizado }) => {
      if (texto && !clienteNormalizado.includes(texto) && !(buscaFolio && String(pedido.id).includes(folio))) {
        return false
      }
      if (aplicaFechas && desde.value && pedido.fechaRegistro < desde.value) return false
      if (aplicaFechas && hasta.value && pedido.fechaRegistro > hasta.value) return false
      return true
    })
  })

  const conteos = computed<ConteosPedidos>(() => {
    const porEstatus: Record<number, number> = {}
    for (const { pedido } of porBusquedaYFechas.value) {
      porEstatus[pedido.estatus] = (porEstatus[pedido.estatus] ?? 0) + 1
    }
    return { todos: porBusquedaYFechas.value.length, porEstatus }
  })

  const filtrados = computed(() =>
    estatus.value === null
      ? porBusquedaYFechas.value
      : porBusquedaYFechas.value.filter(({ pedido }) => pedido.estatus === estatus.value),
  )

  const totalPaginas = computed(() => Math.max(1, Math.ceil(filtrados.value.length / PEDIDOS_POR_PAGINA)))
  const paginaActual = computed(() => Math.min(pagina.value, totalPaginas.value))

  const enPagina = computed(() =>
    filtrados.value.slice((paginaActual.value - 1) * PEDIDOS_POR_PAGINA, paginaActual.value * PEDIDOS_POR_PAGINA),
  )

  const idsClientesPagina = computed(() => enPagina.value.map(({ pedido }) => pedido.idCliente))

  function textoSucursal(pedido: Pedido): string {
    const sucursal = directorio.buscarSucursal(pedido.idCliente, pedido.idSucursal)
    if (sucursal === undefined) return 'Sucursal …'
    return sucursal ? `Sucursal ${sucursal.nombre}` : `Sucursal #${pedido.idSucursal}`
  }

  const filasPagina = computed<FilaPedido[]>(() =>
    enPagina.value.map(({ pedido, cliente, estado, entrega }) => ({
      id: pedido.id,
      cliente,
      sucursal: textoSucursal(pedido),
      registrado: pedido.fechaRegistro,
      entrega,
      estado,
      total: pedido.total,
      totalKg: pedido.totalKg,
    })),
  )

  // Solo se piden las sucursales de los clientes de la página a la vista.
  watch(idsClientesPagina, (ids) => directorio.cargarSucursales(ids))

  // Cualquier cambio de filtros regresa a la primera página.
  watch([estatus, criterio, desde, hasta], () => {
    pagina.value = 1
  })

  async function cargar() {
    cargaVigente += 1
    const numero = cargaVigente
    cargando.value = true
    errorCarga.value = false
    try {
      const [lista] = await Promise.all([obtenerPedidos(), directorio.cargarClientes()])
      if (numero !== cargaVigente) return
      // Sin hora de registro, el Id desempata los del mismo día.
      pedidos.value = [...lista].sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro) || b.id - a.id)
      // La primera página se muestra ya con los nombres de sus sucursales.
      await directorio.cargarSucursales(idsClientesPagina.value)
    } catch (error) {
      if (numero !== cargaVigente) return
      if (error instanceof ErrorPedidos && error.motivo === 'sesion') {
        opciones.alVencerSesion()
        return
      }
      errorCarga.value = true
    } finally {
      if (numero === cargaVigente) cargando.value = false
    }
  }

  const hayFiltros = computed(
    () => estatus.value !== null || criterio.value.trim() !== '' || desde.value !== '' || hasta.value !== '',
  )

  function limpiarFiltros() {
    estatus.value = null
    criterio.value = ''
    desde.value = ''
    hasta.value = ''
  }

  function cambiarPagina(paso: 1 | -1) {
    pagina.value = Math.min(Math.max(paginaActual.value + paso, 1), totalPaginas.value)
  }

  return {
    cargando,
    errorCarga,
    hayPedidos: computed(() => pedidos.value.length > 0),
    estatus,
    criterio,
    desde,
    hasta,
    errorFechas,
    hayFiltros,
    conteos,
    totalFiltrados: computed(() => filtrados.value.length),
    filasPagina,
    paginaActual,
    totalPaginas,
    cargar,
    limpiarFiltros,
    cambiarPagina,
  }
}
