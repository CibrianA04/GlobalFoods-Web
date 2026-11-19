import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

import { normalizarTexto } from '@/modulos/ventas/controladores/formatosPedido'
import type { Cliente } from '@/modulos/ventas/interfaces/cliente'
import { obtenerClientesActivos } from '@/modulos/ventas/servicios/servicioClientesVentas'

export const MENSAJES_BUSQUEDA = {
  cargando: 'Cargando clientes…',
  errorCarga: 'No se pudieron cargar los clientes. Haz clic en el campo para intentar de nuevo.',
  sinClientes: 'No hay clientes activos registrados.',
  sinResultados:
    'No se encontraron clientes con ese criterio. Si es un cliente nuevo, solicite su alta en el sistema interno.',
}

/** Cliente con su nombre y su teléfono ya preparados para comparar. */
export interface ClienteIndexado {
  cliente: Cliente
  /** Sin acentos y en minúsculas. */
  nombre: string
  /** Solo los dígitos del teléfono; vacío si no tiene. */
  digitos: string
}

/** Solo los dígitos, para comparar teléfonos sin importar espacios, guiones o paréntesis. */
const soloDigitos = (texto: string) => texto.replace(/\D/g, '')

/** Ordena los clientes por nombre y los prepara para filtrarClientes(). */
export function indexarClientes(clientes: Cliente[]): ClienteIndexado[] {
  return [...clientes]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((cliente) => ({
      cliente,
      nombre: normalizarTexto(cliente.nombre),
      digitos: cliente.telefono ? soloDigitos(cliente.telefono) : '',
    }))
}

/**
 * Clientes que coinciden con lo escrito, sin importar acentos ni mayúsculas: primero los que
 * empiezan con el texto y después los que lo contienen, cada grupo por nombre. Si lo escrito
 * parece un teléfono, también se compara con el teléfono. Sin texto, regresa todos.
 * La usan el buscador de Nuevo pedido y el de la pestaña Pedidos.
 */
export function filtrarClientes(indice: ClienteIndexado[], criterio: string): Cliente[] {
  const texto = normalizarTexto(criterio)
  if (!texto) return indice.map(({ cliente }) => cliente)

  const digitos = /^[\d\s()+-]+$/.test(texto) ? soloDigitos(texto) : ''
  const alInicio: Cliente[] = []
  const enMedio: Cliente[] = []
  for (const registro of indice) {
    if (registro.nombre.startsWith(texto)) {
      alInicio.push(registro.cliente)
    } else if (registro.nombre.includes(texto) || (digitos !== '' && registro.digitos.includes(digitos))) {
      enMedio.push(registro.cliente)
    }
  }
  return [...alInicio, ...enMedio]
}

/**
 * Estado del buscador de clientes de Nuevo pedido.
 * - Al abrir el campo (clic, foco o flecha abajo) se piden una sola vez los clientes activos y
 *   se despliega la lista completa, por nombre.
 * - Al escribir, la lista se reduce al instante desde la primera letra; no hay que esperar ni
 *   volver a consultar la API.
 * - Si la consulta falla, llama a `alFallar` para que la vista muestre el aviso; se vuelve a
 *   intentar la siguiente vez que se abra el campo.
 */
export function usarBuscadorClientes(opciones: { alFallar: () => void }) {
  const criterio = ref('')
  /** Clientes activos ya consultados, por nombre; null mientras no se tienen. */
  const clientes = shallowRef<ClienteIndexado[] | null>(null)
  const cargando = ref(false)
  const errorCarga = ref(false)
  /** El usuario abrió la lista; se pinta solo si hay opciones (ver `listaAbierta`). */
  const abierta = ref(false)
  /** Opción resaltada con las flechas; -1 si ninguna. */
  const indiceActivo = ref(-1)
  // Si la pantalla se cierra antes de que llegue la respuesta, se descarta.
  let vigente = true

  const resultados = computed<Cliente[]>(() =>
    clientes.value ? filtrarClientes(clientes.value, criterio.value) : [],
  )

  const listaAbierta = computed(() => abierta.value && resultados.value.length > 0)

  /** La opción que elige Enter: la resaltada o, si solo queda una, esa. */
  const opcionParaEnter = computed<Cliente | undefined>(() => {
    if (!listaAbierta.value) return undefined
    if (indiceActivo.value >= 0) return resultados.value[indiceActivo.value]
    return resultados.value.length === 1 ? resultados.value[0] : undefined
  })

  const mensajeAyuda = computed(() => {
    if (cargando.value) return MENSAJES_BUSQUEDA.cargando
    if (errorCarga.value) return MENSAJES_BUSQUEDA.errorCarga
    if (!clientes.value) return ''
    if (clientes.value.length === 0) return MENSAJES_BUSQUEDA.sinClientes
    if (resultados.value.length === 0) return MENSAJES_BUSQUEDA.sinResultados
    return ''
  })

  async function cargarClientes() {
    if (clientes.value || cargando.value) return
    cargando.value = true
    errorCarga.value = false
    try {
      const lista = await obtenerClientesActivos()
      if (!vigente) return
      clientes.value = indexarClientes(lista)
    } catch {
      if (!vigente) return
      errorCarga.value = true
      abierta.value = false
      opciones.alFallar()
    } finally {
      if (vigente) cargando.value = false
    }
  }

  /** Despliega la lista; la primera vez (o después de un error) consulta los clientes. */
  function abrirLista() {
    abierta.value = true
    void cargarClientes()
  }

  function cerrarLista() {
    abierta.value = false
    indiceActivo.value = -1
  }

  /**
   * Al escribir: la lista se vuelve a abrir (por si se cerró con Escape) y se quita el
   * resaltado, porque las opciones cambiaron. No reintenta la consulta en cada tecla.
   */
  function alEscribir() {
    abierta.value = true
    indiceActivo.value = -1
  }

  /** Mueve la opción activa (con vuelta al inicio o al final). Abre la lista si estaba cerrada. */
  function moverActivo(paso: 1 | -1) {
    if (!abierta.value) abrirLista()
    const total = resultados.value.length
    if (total === 0) return
    if (indiceActivo.value === -1) {
      indiceActivo.value = paso === 1 ? 0 : total - 1
      return
    }
    indiceActivo.value = (indiceActivo.value + paso + total) % total
  }

  /** Borra lo escrito y cierra la lista. Los clientes se quedan en memoria para la siguiente vez. */
  function limpiar() {
    criterio.value = ''
    cerrarLista()
  }

  onBeforeUnmount(() => {
    vigente = false
  })

  return {
    criterio,
    resultados,
    cargando,
    listaAbierta,
    indiceActivo,
    opcionParaEnter,
    mensajeAyuda,
    abrirLista,
    cerrarLista,
    alEscribir,
    moverActivo,
    limpiar,
  }
}
