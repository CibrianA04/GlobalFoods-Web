import { computed, ref, watch } from 'vue'

import {
  obtenerInventarioActual,
  type ArticuloInventario,
} from '@/modulos/almacen/servicios/servicioInventario'
import { fechaHoyIso, formatearNumero } from '@/modulos/ventas/controladores/formatosPedido'
import type { Cliente } from '@/modulos/ventas/interfaces/cliente'
import type {
  DatosRegistroPedido,
  ModalidadEntrega,
  ProductoVenta,
  RenglonPedido,
  RenglonResumen,
  ResumenPedido,
} from '@/modulos/ventas/interfaces/pedido'
import { registrarPedido } from '@/modulos/ventas/servicios/servicioPedidos'

// TODO: el inventario no trae la presentación del producto; por ahora todo se vende sin cabeza y por kg.
export const PRESENTACION_PRODUCTO = 'Sin cabeza · venta por kg'

export const MAXIMO_OBSERVACIONES = 250

export const MENSAJES = {
  clienteRequerido: 'Seleccione un cliente.',
  productosRequeridos: 'Agregue al menos un producto al pedido.',
  cantidadInvalida: 'La cantidad debe ser mayor que cero.',
  modalidadRequerida: 'Seleccione la modalidad de entrega.',
  fechaRequerida: 'Seleccione la fecha requerida de entrega.',
  fechaPasada: 'La fecha de entrega no puede ser anterior a hoy.',
  direccionRequerida: 'Capture la dirección de entrega.',
  referenciasRequeridas: 'Capture las referencias de la entrega.',
  inventarioNoDisponible: 'No es posible confirmar la disponibilidad en este momento.',
  errorBusquedaClientes: 'No fue posible consultar los clientes. Intente nuevamente.',
  errorRegistro: 'No fue posible registrar el pedido. Intente nuevamente.',
}

export function mensajeExcedeDisponible(producto: ProductoVenta): string {
  return `Solo hay ${formatearNumero(producto.disponibleKg)} kg disponibles de ${producto.nombre}. Ajuste la cantidad.`
}

/** Ids de los campos: enlazan etiquetas y mensajes, y sirven para llevar el foco al primer error. */
export const IDS_CAMPOS = {
  cliente: 'pedido-cliente',
  agregarProducto: 'pedido-agregar-producto',
  errorProductos: 'pedido-productos-error',
  modalidad: 'pedido-modalidad-domicilio',
  errorModalidad: 'pedido-modalidad-error',
  fecha: 'pedido-fecha',
  direccion: 'pedido-direccion',
  referencias: 'pedido-referencias',
  observaciones: 'pedido-observaciones',
}

export function idCampoCantidad(productoId: string): string {
  return `pedido-cantidad-${productoId.replace(/[^a-zA-Z0-9]+/g, '-')}`
}

export function aProductoVenta(articulo: ArticuloInventario): ProductoVenta {
  return {
    // TODO: ver ProductoVenta.productoId; el inventario no trae id y por ahora se usa la talla.
    productoId: articulo.talla,
    nombre: `Camarón ${articulo.talla}`,
    presentacion: PRESENTACION_PRODUCTO,
    precioKg: articulo.precio,
    disponibleKg: articulo.cantidadKg,
  }
}

const redondear = (valor: number) => Math.round(valor * 100) / 100

/** Lo escrito en el campo de cantidad, como número; null si está vacío o no es un número. */
export function leerCantidad(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return null
  const numero = Number(limpio)
  return Number.isFinite(numero) ? numero : null
}

/** Deja en el campo de cantidad solo dígitos, separador decimal y signo, con máximo 2 decimales. */
export function limpiarCantidad(texto: string): string {
  const soloValidos = texto.replace(/[^\d.,-]/g, '')
  return soloValidos.match(/^-?\d*([.,]\d{0,2})?/)?.[0] ?? ''
}

export function puedeDisminuir(renglon: RenglonPedido): boolean {
  const cantidad = leerCantidad(renglon.cantidadCapturada)
  return cantidad !== null && cantidad > 1
}

export function puedeAumentar(renglon: RenglonPedido): boolean {
  const cantidad = leerCantidad(renglon.cantidadCapturada)
  return cantidad === null || cantidad < renglon.producto.disponibleKg
}

/** Cantidad utilizable para totales: número mayor que cero, o null. */
function cantidadValida(renglon: RenglonPedido): number | null {
  const cantidad = leerCantidad(renglon.cantidadCapturada)
  return cantidad !== null && cantidad > 0 ? cantidad : null
}

/**
 * Estado y reglas del formulario de Nuevo pedido: inventario, cliente, renglones, entrega,
 * validaciones, totales y registro. La vista solo lo pinta y reacciona a sus resultados.
 */
export function usarNuevoPedido() {
  // Inventario (productos que se pueden agregar)
  const productosInventario = ref<ProductoVenta[]>([])
  const cargandoInventario = ref(true)
  const errorInventario = ref(false)

  // Formulario
  const cliente = ref<Cliente | null>(null)
  const renglones = ref<RenglonPedido[]>([])
  const modalidad = ref<ModalidadEntrega | null>(null)
  const fechaEntrega = ref('')
  const usarDireccionRegistrada = ref(false)
  const direccionEntrega = ref('')
  const referencias = ref('')
  const observaciones = ref('')

  /** Los errores (salvo el de disponibilidad) se muestran a partir del primer intento de registrar. */
  const intentoRegistrar = ref(false)
  const enviando = ref(false)

  async function cargarInventario() {
    cargandoInventario.value = true
    errorInventario.value = false
    try {
      productosInventario.value = (await obtenerInventarioActual()).map(aProductoVenta)
    } catch {
      productosInventario.value = []
      errorInventario.value = true
    } finally {
      cargandoInventario.value = false
    }
  }

  // Al elegir un cliente con dirección registrada, se propone esa dirección.
  watch(cliente, (nuevo) => {
    if (nuevo?.direccion) {
      usarDireccionRegistrada.value = true
      direccionEntrega.value = nuevo.direccion
    } else if (usarDireccionRegistrada.value) {
      usarDireccionRegistrada.value = false
      direccionEntrega.value = ''
    }
  })

  watch(usarDireccionRegistrada, (usar) => {
    if (usar && cliente.value?.direccion) direccionEntrega.value = cliente.value.direccion
  })

  // Renglones

  function buscarRenglon(productoId: string) {
    return renglones.value.find((renglon) => renglon.producto.productoId === productoId)
  }

  function agregarProducto(producto: ProductoVenta) {
    if (producto.disponibleKg <= 0 || buscarRenglon(producto.productoId)) return
    renglones.value.push({ producto, cantidadCapturada: '1' })
  }

  function quitarRenglon(productoId: string) {
    renglones.value = renglones.value.filter((renglon) => renglon.producto.productoId !== productoId)
  }

  function cambiarCantidad(productoId: string, texto: string) {
    const renglon = buscarRenglon(productoId)
    if (renglon) renglon.cantidadCapturada = texto
  }

  function aumentarCantidad(productoId: string) {
    const renglon = buscarRenglon(productoId)
    if (!renglon || !puedeAumentar(renglon)) return
    const actual = leerCantidad(renglon.cantidadCapturada)
    const siguiente = actual === null || actual < 1 ? 1 : actual + 1
    renglon.cantidadCapturada = String(redondear(Math.min(siguiente, renglon.producto.disponibleKg)))
  }

  function disminuirCantidad(productoId: string) {
    const renglon = buscarRenglon(productoId)
    if (!renglon || !puedeDisminuir(renglon)) return
    const actual = leerCantidad(renglon.cantidadCapturada) ?? 1
    renglon.cantidadCapturada = String(redondear(Math.max(actual - 1, 1)))
  }

  // Errores

  function calcularErrores() {
    const domicilio = modalidad.value === 'domicilio'
    let fecha = ''
    if (!fechaEntrega.value) fecha = MENSAJES.fechaRequerida
    else if (fechaEntrega.value < fechaHoyIso()) fecha = MENSAJES.fechaPasada

    return {
      cliente: cliente.value ? '' : MENSAJES.clienteRequerido,
      productos: renglones.value.length > 0 ? '' : MENSAJES.productosRequeridos,
      modalidad: modalidad.value ? '' : MENSAJES.modalidadRequerida,
      fecha,
      direccion: domicilio && !direccionEntrega.value.trim() ? MENSAJES.direccionRequerida : '',
      referencias: domicilio && !referencias.value.trim() ? MENSAJES.referenciasRequeridas : '',
    }
  }

  type ErroresPedido = ReturnType<typeof calcularErrores>
  const SIN_ERRORES: ErroresPedido = {
    cliente: '',
    productos: '',
    modalidad: '',
    fecha: '',
    direccion: '',
    referencias: '',
  }

  const errores = computed<ErroresPedido>(() => (intentoRegistrar.value ? calcularErrores() : SIN_ERRORES))

  /** Error de cantidad por producto. El de disponibilidad aparece al instante; el resto, tras intentar registrar. */
  const erroresCantidad = computed<Record<string, string>>(() => {
    const resultado: Record<string, string> = {}
    for (const renglon of renglones.value) {
      const cantidad = leerCantidad(renglon.cantidadCapturada)
      const id = renglon.producto.productoId
      if (cantidad !== null && cantidad > renglon.producto.disponibleKg) {
        resultado[id] = mensajeExcedeDisponible(renglon.producto)
      } else if (intentoRegistrar.value && (cantidad === null || cantidad <= 0)) {
        resultado[id] = MENSAJES.cantidadInvalida
      }
    }
    return resultado
  })

  /**
   * Marca el intento de registrar (para que se vean los errores) y devuelve el id del primer
   * campo con error, en el orden de la pantalla; null si todo es válido.
   */
  function validar(): string | null {
    intentoRegistrar.value = true
    const encontrados = calcularErrores()

    if (encontrados.cliente) return IDS_CAMPOS.cliente
    if (encontrados.productos) {
      // Si "Agregar producto" está deshabilitado no puede recibir el foco; va al mensaje.
      const agregarDeshabilitado = cargandoInventario.value || errorInventario.value
      return agregarDeshabilitado ? IDS_CAMPOS.errorProductos : IDS_CAMPOS.agregarProducto
    }
    const renglonConError = renglones.value.find((renglon) => erroresCantidad.value[renglon.producto.productoId])
    if (renglonConError) return idCampoCantidad(renglonConError.producto.productoId)
    if (encontrados.modalidad) return IDS_CAMPOS.modalidad
    if (encontrados.fecha) return IDS_CAMPOS.fecha
    if (encontrados.direccion) return IDS_CAMPOS.direccion
    if (encontrados.referencias) return IDS_CAMPOS.referencias
    return null
  }

  // Totales y resumen

  const renglonesResumen = computed<RenglonResumen[]>(() =>
    renglones.value.map((renglon) => {
      const cantidadKg = cantidadValida(renglon)
      return {
        productoId: renglon.producto.productoId,
        nombre: renglon.producto.nombre,
        cantidadKg,
        precioKg: renglon.producto.precioKg,
        importe: cantidadKg === null ? 0 : redondear(cantidadKg * renglon.producto.precioKg),
      }
    }),
  )

  const totalKg = computed(() =>
    redondear(renglonesResumen.value.reduce((suma, renglon) => suma + (renglon.cantidadKg ?? 0), 0)),
  )

  const total = computed(() =>
    redondear(renglonesResumen.value.reduce((suma, renglon) => suma + renglon.importe, 0)),
  )

  const resumen = computed<ResumenPedido>(() => ({
    cliente: cliente.value?.nombre ?? null,
    modalidad: modalidad.value,
    fechaEntrega: fechaEntrega.value,
    direccionEntrega: direccionEntrega.value.trim(),
    referencias: referencias.value.trim(),
    observaciones: observaciones.value.trim(),
    renglones: renglonesResumen.value,
    totalKg: totalKg.value,
    total: total.value,
  }))

  const hayDatosCapturados = computed(
    () =>
      cliente.value !== null ||
      renglones.value.length > 0 ||
      modalidad.value !== null ||
      fechaEntrega.value !== '' ||
      direccionEntrega.value.trim() !== '' ||
      referencias.value.trim() !== '' ||
      observaciones.value.trim() !== '',
  )

  // Registro

  function datosParaRegistrar(clienteActual: Cliente, modalidadActual: ModalidadEntrega): DatosRegistroPedido {
    const domicilio = modalidadActual === 'domicilio'
    return {
      clienteId: clienteActual.id,
      modalidad: modalidadActual,
      fechaEntrega: fechaEntrega.value,
      direccionEntrega: domicilio ? direccionEntrega.value.trim() : null,
      referencias: domicilio ? referencias.value.trim() : null,
      observaciones: observaciones.value.trim() || null,
      productos: renglones.value.map((renglon) => ({
        productoId: renglon.producto.productoId,
        cantidadKg: cantidadValida(renglon) ?? 0,
        precioKg: renglon.producto.precioKg,
      })),
    }
  }

  /**
   * Envía el pedido y devuelve su folio. Devuelve null sin enviar nada si ya hay un envío en
   * curso, para que el mismo pedido no se registre dos veces. Si la API falla, lanza el error.
   */
  async function registrar(): Promise<string | null> {
    if (enviando.value) return null

    const clienteActual = cliente.value
    const modalidadActual = modalidad.value
    if (validar() !== null || !clienteActual || !modalidadActual) {
      throw new Error('El pedido tiene datos incompletos.')
    }

    enviando.value = true
    try {
      const { folio } = await registrarPedido(datosParaRegistrar(clienteActual, modalidadActual))
      return folio
    } finally {
      enviando.value = false
    }
  }

  function reiniciar() {
    cliente.value = null
    renglones.value = []
    modalidad.value = null
    fechaEntrega.value = ''
    usarDireccionRegistrada.value = false
    direccionEntrega.value = ''
    referencias.value = ''
    observaciones.value = ''
    intentoRegistrar.value = false
  }

  return {
    productosInventario,
    cargandoInventario,
    errorInventario,
    cliente,
    renglones,
    modalidad,
    fechaEntrega,
    usarDireccionRegistrada,
    direccionEntrega,
    referencias,
    observaciones,
    enviando,
    errores,
    erroresCantidad,
    resumen,
    hayDatosCapturados,
    cargarInventario,
    agregarProducto,
    quitarRenglon,
    cambiarCantidad,
    aumentarCantidad,
    disminuirCantidad,
    validar,
    registrar,
    reiniciar,
  }
}
