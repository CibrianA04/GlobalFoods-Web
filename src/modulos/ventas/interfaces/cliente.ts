/** Cliente registrado, tal como lo devuelve la búsqueda de clientes. */
export interface Cliente {
  id: number
  /** Nombre comercial o de la persona. Es el que se muestra en pantalla. */
  nombre: string
  /** Razón social para facturación; null si no la tiene registrada. */
  razonSocial: string | null
  /** Teléfono tal como se capturó (puede traer espacios). */
  telefono: string
  /** Dirección registrada; null si no tiene. */
  direccion: string | null
  /** Fecha del último pedido (aaaa-mm-dd); null si nunca ha pedido. */
  ultimoPedido: string | null
}
