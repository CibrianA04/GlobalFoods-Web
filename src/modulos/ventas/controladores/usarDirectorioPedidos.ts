import { onUnmounted, shallowRef } from 'vue'

import type { SucursalCliente } from '@/modulos/ventas/interfaces/cliente'
import {
  descartarClientesEnMemoria,
  obtenerClientesActivos,
  obtenerSucursalesCliente,
} from '@/modulos/ventas/servicios/servicioClientesVentas'

/**
 * Nombres de cliente y sucursal para mostrar pedidos, que solo traen IdCliente e IdSucursal.
 * - Clientes: de GET /api/clientes/activos; uno inactivo se muestra como "Cliente #Id".
 * - Sucursales: se piden por cliente, una sola vez cada uno y en paralelo, y se guardan mientras
 *   la pantalla está abierta.
 * Si una consulta falla, la pantalla sigue: se muestran los Id y la siguiente carga lo reintenta.
 */
export function usarDirectorioPedidos() {
  const nombresClientes = shallowRef(new Map<number, string>())
  /** Sucursales por cliente; null si su consulta falló. */
  const sucursalesPorCliente = shallowRef(new Map<number, SucursalCliente[] | null>())
  const consultasEnCurso = new Map<number, Promise<void>>()

  async function cargarClientes() {
    try {
      const clientes = await obtenerClientesActivos()
      nombresClientes.value = new Map(clientes.map((cliente) => [cliente.id, cliente.nombre]))
    } catch {
      // Sin nombres, cada pedido muestra "Cliente #Id".
    }
  }

  function guardarSucursales(idCliente: number, sucursales: SucursalCliente[] | null) {
    sucursalesPorCliente.value = new Map(sucursalesPorCliente.value).set(idCliente, sucursales)
  }

  function cargarSucursalesDe(idCliente: number): Promise<void> {
    // Ya cargadas (aunque sea una lista vacía): no se vuelven a pedir. Si falló, se reintenta.
    if (sucursalesPorCliente.value.get(idCliente)) return Promise.resolve()

    let consulta = consultasEnCurso.get(idCliente)
    if (!consulta) {
      consulta = obtenerSucursalesCliente(idCliente)
        .then((sucursales) => guardarSucursales(idCliente, sucursales))
        .catch(() => guardarSucursales(idCliente, null))
        .finally(() => consultasEnCurso.delete(idCliente))
      consultasEnCurso.set(idCliente, consulta)
    }
    return consulta
  }

  /** Pide, en paralelo, las sucursales de los clientes que todavía no se tienen. Nunca falla. */
  async function cargarSucursales(idsClientes: number[]) {
    await Promise.all([...new Set(idsClientes)].map(cargarSucursalesDe))
  }

  function nombreCliente(idCliente: number): string {
    return nombresClientes.value.get(idCliente) ?? `Cliente #${idCliente}`
  }

  /** undefined mientras se consultan las sucursales del cliente; null si no se encontró. */
  function buscarSucursal(idCliente: number, idSucursal: number): SucursalCliente | null | undefined {
    if (!sucursalesPorCliente.value.has(idCliente)) return undefined
    return sucursalesPorCliente.value.get(idCliente)?.find((sucursal) => sucursal.id === idSucursal) ?? null
  }

  // Los clientes quedan en memoria solo mientras la pantalla está abierta.
  onUnmounted(descartarClientesEnMemoria)

  return { cargarClientes, cargarSucursales, nombreCliente, buscarSucursal }
}
