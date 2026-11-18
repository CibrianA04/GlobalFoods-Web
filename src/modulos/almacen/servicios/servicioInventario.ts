import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ArticuloInventario {
  /** Código del producto como número. null si la API no lo manda como entero positivo. */
  codigoProducto: number | null
  talla: string
  precio: number
  master: number
  cantidadKg: number
}

/** Artículo tal como llega de GET /api/inventario/actual. */
interface ArticuloInventarioAPI {
  /** Texto con dígitos, p. ej. "1000006". */
  codigoProducto?: string | number | null
  talla: string
  precio: number
  master: number
  cantidadKg: number
}

/** "1000006" → 1000006. null si no viene, viene vacío o no es un entero positivo. */
function aCodigoProducto(valor: unknown): number | null {
  const texto = typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : ''
  if (!/^\d+$/.test(texto)) return null
  const codigo = Number(texto)
  return Number.isSafeInteger(codigo) && codigo > 0 ? codigo : null
}

function aArticulo(articulo: ArticuloInventarioAPI): ArticuloInventario {
  return {
    codigoProducto: aCodigoProducto(articulo.codigoProducto),
    talla: articulo.talla,
    precio: articulo.precio,
    master: articulo.master,
    cantidadKg: articulo.cantidadKg,
  }
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
    | ArticuloInventarioAPI[]
    | { error?: string }
    | null

  if (!respuestaHttp.ok) {
    const mensaje = datosRespuesta && !Array.isArray(datosRespuesta) ? datosRespuesta.error : undefined
    throw new Error(mensaje || 'No se pudo cargar el inventario.')
  }

  if (!Array.isArray(datosRespuesta)) {
    throw new Error('La respuesta de la API no contiene una lista de inventario válida.')
  }

  return datosRespuesta.map(aArticulo)
}