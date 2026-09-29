export type ModalidadEntrega = 'domicilio' | 'recoleccion'

/** Producto que se puede vender, armado a partir del inventario actual. */
export interface ProductoVenta {
  /**
   * Identificador del producto.
   * TODO: el inventario (GET /api/inventario/actual) no trae id, así que por ahora es la talla.
   * Cuando haya otras presentaciones de la misma talla (con cabeza, pelado, etc.) la talla
   * dejará de ser única: la API debe devolver un id propio y este campo debe tomarlo de ahí.
   */
  productoId: string
  /** Nombre para mostrar, p. ej. "Camarón 16/20". */
  nombre: string
  presentacion: string
  precioKg: number
  disponibleKg: number
}

/** Renglón del pedido mientras se captura. */
export interface RenglonPedido {
  producto: ProductoVenta
  /**
   * Cantidad en kg tal como está escrita en el campo. Se guarda como texto para no perder
   * lo que se va escribiendo (p. ej. "2.") y para poder marcar como error un campo vacío.
   */
  cantidadCapturada: string
}

/** Producto dentro de los datos para registrar el pedido. */
export interface ProductoRegistroPedido {
  productoId: string
  cantidadKg: number
  /**
   * Precio por kg que vio la asesora al capturar. Es solo una referencia: el backend debe
   * calcular precio y total con sus propios datos y rechazar el pedido si el precio cambió.
   */
  precioKg: number
}

/** Cuerpo de POST /api/pedidos. */
export interface DatosRegistroPedido {
  clienteId: number
  modalidad: ModalidadEntrega
  /** aaaa-mm-dd */
  fechaEntrega: string
  /** null en recolección. */
  direccionEntrega: string | null
  /** null en recolección. */
  referencias: string | null
  /** null si no se capturaron. */
  observaciones: string | null
  productos: ProductoRegistroPedido[]
}

export interface RespuestaRegistroPedido {
  /** Folio asignado, p. ej. "#12348". */
  folio: string
}

/** Renglón ya calculado para mostrar en el resumen y en la confirmación. */
export interface RenglonResumen {
  productoId: string
  nombre: string
  /** null si la cantidad capturada no es un número válido. */
  cantidadKg: number | null
  precioKg: number
  importe: number
}

/** Datos del pedido listos para mostrar (resumen lateral y modal de confirmación). */
export interface ResumenPedido {
  cliente: string | null
  modalidad: ModalidadEntrega | null
  /** aaaa-mm-dd, o vacío si no se ha capturado. */
  fechaEntrega: string
  direccionEntrega: string
  referencias: string
  observaciones: string
  renglones: RenglonResumen[]
  totalKg: number
  total: number
}
