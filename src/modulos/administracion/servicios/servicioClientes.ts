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
  if (!res.ok) throw new Error('Error al actualizar el cliente')
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