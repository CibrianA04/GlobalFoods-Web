import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ClienteAPI {
  Id: number
  Usuario: string
  Contrasena?: string
  Nombre: string
  Telefono: string
  Estatus: number
}

function getHeaders() {
  const token = obtenerToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function obtenerClientesAPI(): Promise<ClienteAPI[]> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/clientes`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Error al obtener los clientes')
  return res.json()
}

export async function crearClienteAPI(datos: Partial<ClienteAPI>): Promise<ClienteAPI> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/clientes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error('Error al crear el cliente')
  return res.json()
}

export async function actualizarClienteAPI(id: number, datos: Partial<ClienteAPI>): Promise<ClienteAPI> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/clientes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'Error al actualizar el cliente')
  }
  return res.json()
}
export async function eliminarClienteAPI(id: number): Promise<boolean> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/clientes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Error al eliminar el cliente')
  return true
}

export async function obtenerClientePorIdAPI(id: number): Promise<ClienteAPI> {
  const token = obtenerToken()
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/clientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al obtener el cliente')
  return res.json()
}

// AQUÍ ESTABA EL ERROR 404: La URL correcta es /api/sucursales-clientes?idCliente=
export async function obtenerSucursalesClienteAPI(idCliente: number): Promise<any[]> {
  const token = obtenerToken()
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/sucursales-clientes?idCliente=${idCliente}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return [] 
  return res.json()
}

export async function obtenerPedidosClienteAPI(idCliente: number): Promise<any[]> {
  const token = obtenerToken()
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/pedidos`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return []
  const todosLosPedidos = await res.json()
  return todosLosPedidos.filter((pedido: any) => pedido.IdCliente === idCliente)
}

// --- NUEVAS FUNCIONES DEL CRUD DE SUCURSALES ---

// --- FUNCIONES DEL CRUD DE SUCURSALES (ACTUALIZADAS CON getHeaders) ---

export async function crearSucursalClienteAPI(datos: any): Promise<any> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/sucursales-clientes`, {
    method: 'POST',
    headers: getHeaders(), 
    body: JSON.stringify(datos)
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'Error al crear la sucursal')
  }
  return res.json()
}

export async function actualizarSucursalClienteAPI(id: number, datos: any): Promise<any> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/sucursales-clientes/${id}`, {
    method: 'PUT',
    headers: getHeaders(), 
    body: JSON.stringify(datos)
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'Error al actualizar la sucursal')
  }
  return res.json()
}

export async function eliminarSucursalClienteAPI(id: number): Promise<boolean> {
  const res = await fetch(`${URL_API.replace(/\/$/, '')}/api/sucursales-clientes/${id}`, {
    method: 'DELETE',
    headers: getHeaders() // Usamos getHeaders()
  })
  if (!res.ok) throw new Error('Error al eliminar sucursal')
  return true
}