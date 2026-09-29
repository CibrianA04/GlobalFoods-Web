import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import type { Cliente } from '@/modulos/ventas/interfaces/cliente'

// SIMULADO: la API todavía no tiene endpoint de clientes. Al conectarla, solo cambia el
// cuerpo de buscarClientes(); la firma y el tipo Cliente se quedan igual.

/** Pon en true para simular que la consulta falla y probar el aviso de error. */
const FORZAR_ERROR_BUSQUEDA = false

const RETARDO_SIMULADO_MS = 300
const MAXIMO_RESULTADOS = 50

const clientesSimulados: Cliente[] = [
  {
    id: 1,
    nombre: 'Restaurante Mar y Tierra',
    razonSocial: 'Mar y Tierra Alimentos, S.A. de C.V.',
    telefono: '667 123 4567',
    direccion: 'Blvd. Francisco I. Madero 1234, Col. Centro, Culiacán',
    ultimoPedido: '2026-08-22',
  },
  {
    id: 2,
    nombre: 'Mariscos El Faro',
    razonSocial: 'Pescados y Mariscos El Faro, S. de R.L. de C.V.',
    telefono: '667 234 5678',
    direccion: 'Av. Álvaro Obregón 845, Col. Almada, Culiacán',
    ultimoPedido: '2026-09-15',
  },
  {
    id: 3,
    nombre: 'Cocina Económica Doña Lupita',
    razonSocial: null,
    telefono: '667 345 6789',
    direccion: 'Calle Rosales 210, Col. Centro, Culiacán',
    ultimoPedido: null,
  },
  {
    id: 4,
    nombre: 'Victoria Ontiveros',
    razonSocial: null,
    telefono: '667 456 7890',
    direccion: null,
    ultimoPedido: '2026-09-27',
  },
  {
    id: 5,
    nombre: 'Mariscos Los Arcos',
    razonSocial: 'Operadora Los Arcos, S.A. de C.V.',
    telefono: '667 567 8901',
    direccion: 'Blvd. Pedro Infante 2400, Desarrollo Urbano Tres Ríos, Culiacán',
    ultimoPedido: '2026-09-02',
  },
  {
    id: 6,
    nombre: 'Hotel Plaza Culiacán',
    razonSocial: 'Hotelera del Pacífico, S.A. de C.V.',
    telefono: '667 678 9012',
    direccion: 'Av. Insurgentes 900, Col. Centro Sinaloa, Culiacán',
    ultimoPedido: '2026-07-30',
  },
  {
    id: 7,
    nombre: 'Pescadería La Perla',
    razonSocial: null,
    telefono: '667 789 0123',
    direccion: 'Mercado Garmendia, local 14, Col. Centro, Culiacán',
    ultimoPedido: '2026-09-10',
  },
  {
    id: 8,
    nombre: 'Taquería El Güero',
    razonSocial: null,
    telefono: '667 890 1234',
    direccion: 'Calle Juan Carrasco 512, Col. Jorge Almada, Culiacán',
    ultimoPedido: '2026-06-18',
  },
]

/** Minúsculas y sin acentos, para comparar sin importar cómo se escribió. */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const esperar = (milisegundos: number) => new Promise((resolver) => setTimeout(resolver, milisegundos))

/**
 * Busca clientes registrados por nombre, razón social o teléfono (ignora espacios del teléfono).
 * Devuelve como máximo 50, ordenados por nombre.
 *
 * Endpoint propuesto (TODAVÍA NO EXISTE en la API):
 *   GET /api/clientes?busqueda={criterio}
 *   Authorization: Bearer <token>
 *   200 → Cliente[] (el filtro, el orden y el límite de 50 los aplica la API)
 *   4xx/5xx → { error: string }
 * Al conectarlo, seguir el mismo manejo que obtenerInventarioActual() en servicioInventario.ts.
 */
export async function buscarClientes(criterio: string): Promise<Cliente[]> {
  const token = obtenerToken()
  if (!token) {
    throw new Error('La sesión no está activa. Inicia sesión nuevamente.')
  }

  await esperar(RETARDO_SIMULADO_MS)

  if (FORZAR_ERROR_BUSQUEDA) {
    throw new Error('No se pudo consultar los clientes.')
  }

  const texto = normalizar(criterio)
  const telefono = criterio.replace(/\s+/g, '')

  return clientesSimulados
    .filter(
      (cliente) =>
        normalizar(cliente.nombre).includes(texto) ||
        (cliente.razonSocial !== null && normalizar(cliente.razonSocial).includes(texto)) ||
        (telefono !== '' && cliente.telefono.replace(/\s+/g, '').includes(telefono)),
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, MAXIMO_RESULTADOS)
    .map((cliente) => ({ ...cliente }))
}
