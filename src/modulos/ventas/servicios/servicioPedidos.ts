import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { fechaHoyIso, formatearFecha } from '@/modulos/ventas/controladores/formatosPedido'
import type {
  DatosRegistroPedido,
  ModalidadEntrega,
  RespuestaRegistroPedido,
} from '@/modulos/ventas/interfaces/pedido'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/** Estatus de un pedido nuevo. Después pasa a 2 surtido, 3 en reparto y 4 completado. */
const ESTATUS_CREADO = 1

/** Si la API no responde en este tiempo, se cancela la petición. */
const LIMITE_ESPERA_MS = 10_000

const MODALIDAD_EN_OBSERVACIONES: Record<ModalidadEntrega, string> = {
  domicilio: 'A domicilio',
  recoleccion: 'Recolección en congeladora',
}

/** Cuerpo de POST /api/pedidos. */
interface PedidoAPI {
  IdCliente: number
  IdSucursal: number
  /** Fecha del pedido como entero aaaammdd, p. ej. 20261027. */
  Fecha: number
  TotalKG: number
  Total: number
  Estatus: number
  Observaciones: string
  lineas: LineaPedidoAPI[]
}

interface LineaPedidoAPI {
  // TODO: falta CodigoProducto; el inventario no lo trae.
  Talla: string
  Cantidad: number
  Precio: number
  Subtotal: number
}

/** Por qué falló el registro; la vista elige el mensaje según el motivo. */
export type MotivoErrorRegistro = 'sesion' | 'conexion' | 'api'

export class ErrorRegistroPedido extends Error {
  readonly motivo: MotivoErrorRegistro

  constructor(motivo: MotivoErrorRegistro, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorRegistroPedido'
    this.motivo = motivo
  }
}

/**
 * La API no tiene campos para modalidad, fecha de entrega ni referencias: van en Observaciones,
 * seguidas de lo que capturó la asesora.
 * "A domicilio · Entrega 28/10/2026 · Ref: portón negro · Llamar antes de llegar"
 */
function armarObservaciones(datos: DatosRegistroPedido): string {
  const partes = [MODALIDAD_EN_OBSERVACIONES[datos.modalidad], `Entrega ${formatearFecha(datos.fechaEntrega)}`]
  if (datos.modalidad === 'domicilio' && datos.referencias) partes.push(`Ref: ${datos.referencias}`)
  if (datos.observaciones) partes.push(datos.observaciones)
  return partes.join(' · ')
}

function aPedidoAPI(datos: DatosRegistroPedido): PedidoAPI {
  return {
    IdCliente: datos.clienteId,
    IdSucursal: datos.idSucursal,
    Fecha: Number(fechaHoyIso().replace(/-/g, '')),
    TotalKG: datos.totalKg,
    Total: datos.total,
    Estatus: ESTATUS_CREADO,
    Observaciones: armarObservaciones(datos),
    lineas: datos.productos.map((producto) => ({
      // TODO: ver ProductoVenta.productoId; por ahora es la talla.
      Talla: producto.productoId,
      Cantidad: producto.cantidadKg,
      Precio: producto.precioKg,
      Subtotal: producto.importe,
    })),
  }
}

/**
 * Registra un pedido nuevo (Estatus 1) y devuelve su folio: "#" y el Id que asigna la API.
 *
 *   POST /api/pedidos
 *   Authorization: Bearer <token>
 *   Cuerpo: PedidoAPI
 *   201 → el pedido creado, con su Id
 *   400/401/403/500 → { error: string }
 *
 * Lanza ErrorRegistroPedido con motivo "sesion" si no hay sesión o la API responde 401,
 * "conexion" si no hay conexión o pasan 10 s sin respuesta, y "api" con cualquier otro error.
 */
export async function registrarPedido(datos: DatosRegistroPedido): Promise<RespuestaRegistroPedido> {
  const token = obtenerToken()
  if (!token) {
    throw new ErrorRegistroPedido('sesion', 'La sesión no está activa. Inicia sesión nuevamente.')
  }

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), LIMITE_ESPERA_MS)

  let respuestaHttp: Response
  try {
    respuestaHttp = await fetch(`${URL_API.replace(/\/$/, '')}/api/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(aPedidoAPI(datos)),
      signal: controlador.signal,
    })
  } catch {
    throw new ErrorRegistroPedido('conexion', 'No se pudo conectar con el servidor para registrar el pedido.')
  } finally {
    clearTimeout(temporizador)
  }

  const datosRespuesta = (await respuestaHttp.json().catch(() => null)) as { Id?: number; error?: string } | null

  if (respuestaHttp.status === 401) {
    throw new ErrorRegistroPedido('sesion', datosRespuesta?.error || 'La sesión expiró.')
  }

  if (!respuestaHttp.ok) {
    throw new ErrorRegistroPedido('api', datosRespuesta?.error || 'No se pudo registrar el pedido.')
  }

  if (datosRespuesta?.Id === undefined || datosRespuesta.Id === null) {
    throw new ErrorRegistroPedido('api', 'La respuesta de la API no trae el Id del pedido.')
  }

  return { folio: `#${datosRespuesta.Id}` }
}
