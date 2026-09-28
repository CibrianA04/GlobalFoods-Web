import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ArticuloInventario {
  talla: string
  precio: number
  master: number
  cantidadKg: number
}

export async function obtenerInventarioActual(): Promise<ArticuloInventario[]> {
  const token = obtenerToken()
  if (!token) {
    throw new Error('La sesión no está activa. Inicia sesión nuevamente.')
  }

  let respuestaHttp: Response
  try {
    respuestaHttp = await fetch(`${URL_API.replace(/\/$/, '')}/api/inventario/actual`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor para cargar el inventario.')
  }

  const datosRespuesta = await respuestaHttp.json().catch(() => null) as
    | ArticuloInventario[]
    | { error?: string }
    | null

  if (!respuestaHttp.ok) {
    const mensaje = datosRespuesta && !Array.isArray(datosRespuesta) ? datosRespuesta.error : undefined
    throw new Error(mensaje || 'No se pudo cargar el inventario.')
  }

  if (!Array.isArray(datosRespuesta)) {
    throw new Error('La respuesta de la API no contiene una lista de inventario válida.')
  }

  return datosRespuesta
}