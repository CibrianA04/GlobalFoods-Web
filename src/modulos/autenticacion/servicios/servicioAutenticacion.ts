const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface RespuestaInicioSesion {
  tokenType: string
  accessToken: string
  expiresIn: number
  nombre: string
}

export async function iniciarSesionUsuario(
  usuario: string,
  contrasena: string,
): Promise<RespuestaInicioSesion> {
  let respuestaHttp: Response

  try {
    respuestaHttp = await fetch(`${URL_API.replace(/\/$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, contrasena }),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que la API esté activa.')
  }

  const datosRespuesta = await respuestaHttp.json().catch(() => ({})) as Partial<RespuestaInicioSesion> & {
    error?: string
  }

  if (!respuestaHttp.ok) {
    throw new Error(datosRespuesta.error || 'No se pudo iniciar sesión.')
  }

  if (typeof datosRespuesta.accessToken !== 'string' || !datosRespuesta.accessToken) {
    throw new Error('La respuesta de la API no contiene un token válido.')
  }

  if (typeof datosRespuesta.nombre !== 'string' || !datosRespuesta.nombre) {
    throw new Error('La respuesta de la API no contiene el nombre del usuario.')
  }

  return datosRespuesta as RespuestaInicioSesion
}

export function guardarToken(tokenAcceso: string, nombreUsuario: string): void {
  localStorage.setItem('token', tokenAcceso)
  localStorage.setItem('nombreUsuario', nombreUsuario)
}

export function obtenerToken(): string | null {
  return localStorage.getItem('token')
}

export function obtenerNombreUsuario(): string | null {
  return localStorage.getItem('nombreUsuario')
}

export function cerrarSesion(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('nombreUsuario')
}

export function haySesion(): boolean {
  return !!obtenerToken()
}
