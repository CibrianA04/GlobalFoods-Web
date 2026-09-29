import { obtenerToken } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import type { DatosRegistroPedido, RespuestaRegistroPedido } from '@/modulos/ventas/interfaces/pedido'

// SIMULADO: la API todavía no tiene endpoint de pedidos. Al conectarla, solo cambia el
// cuerpo de registrarPedido(); la firma y los tipos se quedan igual.

/** Pon en true para simular que el registro falla y probar el aviso de error. */
const FORZAR_ERROR_REGISTRO = false

const RETARDO_SIMULADO_MS = 800

// Folio consecutivo simulado. Sigue a los pedidos de ejemplo del panel (#12345 a #12347).
let siguienteFolio = 12348

const esperar = (milisegundos: number) => new Promise((resolver) => setTimeout(resolver, milisegundos))

/**
 * Registra un pedido nuevo. Queda en estado Pendiente y aparece en la lista de almacén.
 *
 * Endpoint propuesto (TODAVÍA NO EXISTE en la API):
 *   POST /api/pedidos
 *   Authorization: Bearer <token>
 *   Cuerpo: DatosRegistroPedido
 *   201 → { folio: "#12348" }
 *   4xx/5xx → { error: string }
 * La API debe revalidar la disponibilidad y calcular precio y total con sus propios datos;
 * `precioKg` es solo el precio que vio la asesora, y si ya no coincide debe rechazar el pedido.
 * Al conectarlo, seguir el mismo manejo que obtenerInventarioActual() en servicioInventario.ts.
 */
export async function registrarPedido(datos: DatosRegistroPedido): Promise<RespuestaRegistroPedido> {
  const token = obtenerToken()
  if (!token) {
    throw new Error('La sesión no está activa. Inicia sesión nuevamente.')
  }

  await esperar(RETARDO_SIMULADO_MS)

  if (FORZAR_ERROR_REGISTRO) {
    throw new Error('No se pudo registrar el pedido.')
  }

  if (datos.productos.length === 0) {
    throw new Error('El pedido no tiene productos.')
  }

  const folio = `#${siguienteFolio}`
  siguienteFolio += 1
  return { folio }
}
