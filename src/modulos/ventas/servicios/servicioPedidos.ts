import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { ESTATUS } from '@/modulos/ventas/controladores/estadosPedido'
import { fechaHoyIso } from '@/modulos/ventas/controladores/formatosPedido'
import { armarObservaciones } from '@/modulos/ventas/controladores/observacionesPedido'
import type {
  DatosRegistroPedido,
  LineaPedido,
  Pedido,
  RespuestaRegistroPedido,
} from '@/modulos/ventas/interfaces/pedido'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/** Si la API no responde en este tiempo, se cancela la petición. */
const LIMITE_ESPERA_MS = 10_000

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
  /** Entero positivo; la API rechaza la línea sin él. */
  CodigoProducto: number
  Talla: string
  Cantidad: number
  Precio: number
  Subtotal: number
}

/** Pedido tal como llega de GET /api/pedidos y GET /api/pedidos/:id. */
interface PedidoConsultadoAPI {
  Id: number
  IdCliente: number
  IdSucursal: number
  /** Fecha de registro como entero aaaammdd. */
  Fecha: number
  TotalKG: number
  Total: number
  Estatus: number
  Observaciones: string | null
  lineas?: LineaConsultadaAPI[]
}

interface LineaConsultadaAPI {
  Id: number
  CodigoProducto: number | null
  Talla: string
  Cantidad: number
  Precio: number
  Subtotal: number
}

/**
 * Por qué falló una petición de pedidos; la vista elige el mensaje según el motivo.
 * "datos_invalidos" es un 400: la API rechazó lo que se le mandó.
 */
export type MotivoErrorPedidos = 'sesion' | 'conexion' | 'no_encontrado' | 'datos_invalidos' | 'api'

export class ErrorPedidos extends Error {
  readonly motivo: MotivoErrorPedidos
  /** Texto de `{ error }` que mandó la API; vacío si no mandó ninguno. */
  readonly mensajeApi: string

  constructor(motivo: MotivoErrorPedidos, mensaje: string, mensajeApi = '') {
    super(mensaje)
    this.name = 'ErrorPedidos'
    this.motivo = motivo
    this.mensajeApi = mensajeApi
  }
}

/** El texto de `{ error }` de la API, si viene. */
function mensajeDeError(datos: unknown): string {
  return datos && typeof datos === 'object' && 'error' in datos && typeof datos.error === 'string' ? datos.error : ''
}

/**
 * Petición a la API de pedidos con el token de la sesión; regresa el JSON de la respuesta.
 * Lanza ErrorPedidos con motivo "sesion" si no hay sesión o la API responde 401, "conexion" si no
 * hay conexión o pasan 10 s sin respuesta, "no_encontrado" con 404, "datos_invalidos" con 400 y
 * "api" con cualquier otro error. Si la API manda `{ error }`, queda en `mensajeApi`.
 * `accion` completa los mensajes: "registrar el pedido", "consultar los pedidos".
 */
async function solicitar(ruta: string, accion: string, envio?: { metodo: 'POST'; cuerpo: unknown }): Promise<unknown> {
  const token = obtenerToken()
  if (!token) {
    throw new ErrorPedidos('sesion', 'La sesión no está activa. Inicia sesión nuevamente.')
  }

  const encabezados: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (envio) encabezados['Content-Type'] = 'application/json'

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), LIMITE_ESPERA_MS)

  let respuestaHttp: Response
  try {
    respuestaHttp = await fetch(`${URL_API.replace(/\/$/, '')}${ruta}`, {
      method: envio?.metodo ?? 'GET',
      headers: encabezados,
      body: envio ? JSON.stringify(envio.cuerpo) : undefined,
      signal: controlador.signal,
    })
  } catch {
    throw new ErrorPedidos('conexion', `No se pudo conectar con el servidor para ${accion}.`)
  } finally {
    clearTimeout(temporizador)
  }

  const datosRespuesta: unknown = await respuestaHttp.json().catch(() => null)
  const mensajeApi = mensajeDeError(datosRespuesta)

  if (respuestaHttp.status === 401) {
    throw new ErrorPedidos('sesion', mensajeApi || 'La sesión expiró.', mensajeApi)
  }

  if (respuestaHttp.status === 404) {
    throw new ErrorPedidos('no_encontrado', mensajeApi || 'No se encontró el pedido.', mensajeApi)
  }

  if (respuestaHttp.status === 400) {
    throw new ErrorPedidos('datos_invalidos', mensajeApi || `No se pudo ${accion}.`, mensajeApi)
  }

  if (!respuestaHttp.ok) {
    throw new ErrorPedidos('api', mensajeApi || `No se pudo ${accion}.`, mensajeApi)
  }

  return datosRespuesta
}

function aPedidoAPI(datos: DatosRegistroPedido): PedidoAPI {
  return {
    IdCliente: datos.clienteId,
    IdSucursal: datos.idSucursal,
    Fecha: Number(fechaHoyIso().replace(/-/g, '')),
    TotalKG: datos.totalKg,
    Total: datos.total,
    Estatus: ESTATUS.creado,
    Observaciones: armarObservaciones(datos),
    lineas: datos.productos.map((producto) => ({
      CodigoProducto: producto.codigoProducto,
      Talla: producto.talla,
      Cantidad: producto.cantidadKg,
      Precio: producto.precioKg,
      Subtotal: producto.importe,
    })),
  }
}

/** Número de la API (puede llegar como texto, p. ej. un decimal); 0 si no es un número. */
function aNumero(valor: unknown): number {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

/** 20261027 → "2026-10-27"; vacío si no es una fecha aaaammdd. */
function fechaIsoDeEntero(fecha: unknown): string {
  const texto = String(fecha)
  return /^\d{8}$/.test(texto) ? `${texto.slice(0, 4)}-${texto.slice(4, 6)}-${texto.slice(6, 8)}` : ''
}

function aLinea(linea: LineaConsultadaAPI): LineaPedido {
  return {
    id: aNumero(linea.Id),
    codigoProducto: linea.CodigoProducto ?? null,
    talla: String(linea.Talla ?? '').trim(),
    cantidadKg: aNumero(linea.Cantidad),
    precioKg: aNumero(linea.Precio),
    subtotal: aNumero(linea.Subtotal),
  }
}

function aPedido(pedido: PedidoConsultadoAPI): Pedido {
  return {
    id: aNumero(pedido.Id),
    idCliente: aNumero(pedido.IdCliente),
    idSucursal: aNumero(pedido.IdSucursal),
    fechaRegistro: fechaIsoDeEntero(pedido.Fecha),
    totalKg: aNumero(pedido.TotalKG),
    total: aNumero(pedido.Total),
    estatus: aNumero(pedido.Estatus),
    observaciones: pedido.Observaciones ?? '',
    lineas: (pedido.lineas ?? []).map(aLinea),
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
 */
export async function registrarPedido(datos: DatosRegistroPedido): Promise<RespuestaRegistroPedido> {
  const creado = (await solicitar('/api/pedidos', 'registrar el pedido', {
    metodo: 'POST',
    cuerpo: aPedidoAPI(datos),
  })) as { Id?: number } | null

  if (creado?.Id === undefined || creado.Id === null) {
    throw new ErrorPedidos('api', 'La respuesta de la API no trae el Id del pedido.')
  }

  return { folio: `#${creado.Id}` }
}

/**
 * Todos los pedidos, con sus líneas, en el orden en que los regresa la API.
 *
 *   GET /api/pedidos
 *   200 → PedidoConsultadoAPI[]
 */
export async function obtenerPedidos(): Promise<Pedido[]> {
  const datos = await solicitar('/api/pedidos', 'consultar los pedidos')
  if (!Array.isArray(datos)) {
    throw new ErrorPedidos('api', 'La respuesta de la API no trae una lista de pedidos válida.')
  }
  return (datos as PedidoConsultadoAPI[]).map(aPedido)
}

/**
 * Un pedido con sus líneas. Si no existe, lanza ErrorPedidos con motivo "no_encontrado".
 *
 *   GET /api/pedidos/:id
 *   200 → PedidoConsultadoAPI
 *   404 → { error: string }
 */
export async function obtenerPedidoPorId(id: number): Promise<Pedido> {
  const datos = await solicitar(`/api/pedidos/${encodeURIComponent(id)}`, 'consultar el pedido')
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorPedidos('api', 'La respuesta de la API no trae un pedido válido.')
  }
  return aPedido(datos as PedidoConsultadoAPI)
}
