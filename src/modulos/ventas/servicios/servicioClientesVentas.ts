import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { normalizarTexto } from '@/modulos/ventas/controladores/formatosPedido'
import type { Cliente, SucursalCliente } from '@/modulos/ventas/interfaces/cliente'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const MAXIMO_RESULTADOS = 50
const ESTATUS_ACTIVO = 1

/** Cliente tal como llega de GET /api/clientes/activos. */
interface ClienteActivoAPI {
  Id: number
  Nombre: string
  /** Todavía no lo manda la API; se pidió al backend que lo agregue. */
  Telefono?: string | null
}

/** Sucursal tal como llega de GET /api/sucursales-clientes?idCliente={id}. */
interface SucursalClienteAPI {
  Id: number
  IdCliente: number
  NombreSucursal: string
  Direccion: string | null
  Telefono: string | null
  Estatus: number
}

/**
 * Pide una lista a la API con el token de la sesión. Lanza error si no hay sesión, si no hay
 * conexión, si la API responde con error o si la respuesta no es una lista.
 * `descripcion` completa los mensajes: "los clientes", "las sucursales".
 */
async function consultarLista<T>(ruta: string, descripcion: string): Promise<T[]> {
  const token = obtenerToken()
  if (!token) {
    throw new Error('La sesión no está activa. Inicia sesión nuevamente.')
  }

  let respuestaHttp: Response
  try {
    respuestaHttp = await fetch(`${URL_API.replace(/\/$/, '')}${ruta}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error(`No se pudo conectar con el servidor para consultar ${descripcion}.`)
  }

  const datosRespuesta = (await respuestaHttp.json().catch(() => null)) as T[] | { error?: string } | null

  if (!respuestaHttp.ok) {
    const mensaje = datosRespuesta && !Array.isArray(datosRespuesta) ? datosRespuesta.error : undefined
    throw new Error(mensaje || `No se pudo consultar ${descripcion}.`)
  }

  if (!Array.isArray(datosRespuesta)) {
    throw new Error(`La respuesta de la API no trae ${descripcion} en una lista válida.`)
  }

  return datosRespuesta
}

/** Texto recortado; null si viene vacío o no viene. */
const textoOpcional = (texto: string | null | undefined) => texto?.trim() || null

function aCliente(cliente: ClienteActivoAPI): Cliente {
  return {
    id: cliente.Id,
    nombre: cliente.Nombre.trim(),
    telefono: textoOpcional(cliente.Telefono),
  }
}

function aSucursal(sucursal: SucursalClienteAPI): SucursalCliente {
  return {
    id: sucursal.Id,
    nombre: sucursal.NombreSucursal.trim(),
    direccion: textoOpcional(sucursal.Direccion),
    telefono: textoOpcional(sucursal.Telefono),
  }
}

/** Solo los dígitos, para comparar teléfonos sin importar espacios, guiones o paréntesis. */
const soloDigitos = (texto: string) => texto.replace(/\D/g, '')

// Clientes activos en memoria mientras está abierta la pantalla que los usa (Nuevo pedido,
// Pedidos o el detalle de un pedido): la primera consulta los pide a la API y las siguientes
// los toman de aquí. Se guarda la promesa para que dos consultas seguidas compartan la misma
// petición. Cada vista la descarta al cerrarse.
let clientesEnMemoria: Promise<Cliente[]> | null = null

function clientesActivosEnMemoria(): Promise<Cliente[]> {
  if (!clientesEnMemoria) {
    const consulta = consultarLista<ClienteActivoAPI>('/api/clientes/activos', 'los clientes').then((lista) =>
      lista.map(aCliente),
    )
    // Si falla, se olvida para que el siguiente intento vuelva a consultar la API.
    consulta.catch(() => {
      if (clientesEnMemoria === consulta) clientesEnMemoria = null
    })
    clientesEnMemoria = consulta
  }
  return clientesEnMemoria
}

/** Descarta los clientes en memoria; la siguiente consulta los vuelve a pedir a la API. */
export function descartarClientesEnMemoria() {
  clientesEnMemoria = null
}

/** Todos los clientes activos (de la memoria, si ya se pidieron). Ver buscarClientes(). */
export async function obtenerClientesActivos(): Promise<Cliente[]> {
  return (await clientesActivosEnMemoria()).map((cliente) => ({ ...cliente }))
}

/**
 * Busca clientes activos por nombre o teléfono, sin importar acentos ni mayúsculas.
 * Devuelve como máximo 50, ordenados por nombre.
 *
 *   GET /api/clientes/activos
 *   Authorization: Bearer <token>
 *   200 → [{ Id, Nombre }] (todos los activos; el filtro, el orden y el límite se aplican aquí)
 *   4xx/5xx → { error: string }
 *
 * No usar GET /api/clientes: regresa las contraseñas de los clientes.
 */
export async function buscarClientes(criterio: string): Promise<Cliente[]> {
  const clientes = await clientesActivosEnMemoria()

  const texto = normalizarTexto(criterio)
  // Solo se compara con el teléfono si lo capturado parece un número.
  const digitos = /^[\d\s()+-]+$/.test(criterio.trim()) ? soloDigitos(criterio) : ''

  return clientes
    .filter(
      (cliente) =>
        normalizarTexto(cliente.nombre).includes(texto) ||
        (digitos !== '' && cliente.telefono !== null && soloDigitos(cliente.telefono).includes(digitos)),
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, MAXIMO_RESULTADOS)
    .map((cliente) => ({ ...cliente }))
}

/**
 * Sucursales de un cliente, tal como llegan de la API.
 *
 *   GET /api/sucursales-clientes?idCliente={id}
 *   Authorization: Bearer <token>
 *   200 → [{ Id, IdCliente, NombreSucursal, Direccion, Telefono, Estatus }]
 *
 * Si la consulta falla lanza error (no devuelve una lista vacía), para no confundir un fallo
 * con un cliente sin sucursales.
 */
async function consultarSucursales(idCliente: number): Promise<SucursalClienteAPI[]> {
  const sucursales = await consultarLista<SucursalClienteAPI>(
    `/api/sucursales-clientes?idCliente=${encodeURIComponent(idCliente)}`,
    'las sucursales',
  )
  // Se revisa también el cliente por si la API llegara a ignorar el filtro.
  return sucursales.filter((sucursal) => sucursal.IdCliente === idCliente)
}

const porNombre = (a: SucursalCliente, b: SucursalCliente) => a.nombre.localeCompare(b.nombre, 'es')

/** Sucursales activas (Estatus 1) de un cliente, ordenadas por nombre: entre ellas se elige al capturar. */
export async function obtenerSucursalesActivas(idCliente: number): Promise<SucursalCliente[]> {
  const sucursales = await consultarSucursales(idCliente)
  return sucursales
    .filter((sucursal) => sucursal.Estatus === ESTATUS_ACTIVO)
    .map(aSucursal)
    .sort(porNombre)
}

/**
 * Todas las sucursales de un cliente, activas e inactivas, ordenadas por nombre. Para mostrar
 * pedidos ya registrados, cuya sucursal pudo desactivarse después.
 */
export async function obtenerSucursalesCliente(idCliente: number): Promise<SucursalCliente[]> {
  const sucursales = await consultarSucursales(idCliente)
  return sucursales.map(aSucursal).sort(porNombre)
}
