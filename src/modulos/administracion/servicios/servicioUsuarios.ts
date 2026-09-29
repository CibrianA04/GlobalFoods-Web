import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface UsuarioAPI {
  Id: number
  Usuario: string
  Contraseña?: string
  Nombre: string
  TipoUsuario: string
  Estatus: number
}

export interface DatosFormularioUsuario {
  usuario: string
  contrasena: string
  nombre: string
  tipoUsuario: string
  estatus: number
}

// 1. Obtener todos los usuarios
export async function obtenerUsuarios(): Promise<UsuarioAPI[]> {
  const token = obtenerToken()
  if (!token) throw new Error('La sesión no está activa. Inicia sesión nuevamente.')

  const respuesta = await fetch(`${URL_API.replace(/\/$/, '')}/api/usuarios`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => null)
    throw new Error(errorData?.error || 'No se pudo obtener la lista de usuarios.')
  }

  return await respuesta.json()
}

// 2. Crear un nuevo usuario
export async function crearUsuarioAPI(datos: DatosFormularioUsuario): Promise<UsuarioAPI> {
  const token = obtenerToken()
  if (!token) throw new Error('La sesión no está activa. Inicia sesión nuevamente.')

  const respuesta = await fetch(`${URL_API.replace(/\/$/, '')}/api/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => null)
    throw new Error(errorData?.error || 'No se pudo crear el usuario.')
  }

  return await respuesta.json()
}

// 3. Actualizar/Modificar un usuario existente
export async function actualizarUsuarioAPI(id: number, datos: DatosFormularioUsuario): Promise<UsuarioAPI> {
  const token = obtenerToken()
  if (!token) throw new Error('La sesión no está activa. Inicia sesión nuevamente.')

  const respuesta = await fetch(`${URL_API.replace(/\/$/, '')}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => null)
    throw new Error(errorData?.error || 'No se pudo actualizar el usuario.')
  }

  return await respuesta.json()
}

// 4. Eliminar un usuario
export async function eliminarUsuarioAPI(id: number): Promise<void> {
  const token = obtenerToken()
  if (!token) throw new Error('La sesión no está activa. Inicia sesión nuevamente.')

  const respuesta = await fetch(`${URL_API.replace(/\/$/, '')}/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => null)
    throw new Error(errorData?.error || 'No se pudo eliminar el usuario.')
  }
}