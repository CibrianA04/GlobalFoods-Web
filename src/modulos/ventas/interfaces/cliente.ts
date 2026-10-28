/** Cliente activo, tal como lo devuelve la búsqueda de clientes. */
export interface Cliente {
  id: number
  /** Nombre comercial o de la persona. Es el que se muestra en pantalla. */
  nombre: string
  /**
   * Teléfono tal como se capturó; null si no lo tiene.
   * TODO: GET /api/clientes/activos todavía no lo trae (se pidió al backend). Cuando llegue,
   * la búsqueda ya lo usa y la pantalla ya lo muestra sin más cambios.
   */
  telefono: string | null
}

/** Sucursal activa de un cliente: el lugar al que se entrega el pedido. */
export interface SucursalCliente {
  id: number
  nombre: string
  /** null si no tiene dirección registrada. */
  direccion: string | null
  /** null si no tiene teléfono registrado. */
  telefono: string | null
}
