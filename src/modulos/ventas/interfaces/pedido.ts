export type ModalidadEntrega = 'domicilio' | 'recoleccion'

/** Producto que se puede vender, armado a partir del inventario actual. */
export interface ProductoVenta {
  /** Identificador del producto en la captura: String(codigoProducto). */
  productoId: string
  /**
   * Código del producto (CodigoProducto en POST /api/pedidos).
   * null si el inventario no lo trae como entero positivo: el producto se muestra como no
   * disponible y no se puede agregar.
   */
  codigoProducto: number | null
  talla: string
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
  codigoProducto: number
  talla: string
  cantidadKg: number
  /**
   * Precio por kg que vio la asesora al capturar. La API lo guarda tal cual; lo ideal es que
   * lo revalide con sus propios datos y rechace el pedido si el precio cambió.
   */
  precioKg: number
  /** cantidadKg × precioKg, redondeado a centavos (el importe del renglón en el resumen). */
  importe: number
}

/** Datos del pedido capturado. servicioPedidos los convierte al cuerpo de POST /api/pedidos. */
export interface DatosRegistroPedido {
  clienteId: number
  /** Sucursal del cliente a la que va el pedido. */
  idSucursal: number
  modalidad: ModalidadEntrega
  /** aaaa-mm-dd */
  fechaEntrega: string
  /**
   * null en recolección.
   * TODO: la API no tiene campo para la dirección de entrega y no se envía; el pedido solo
   * lleva la sucursal (IdSucursal). Si la asesora escribe otra dirección, se pierde.
   */
  direccionEntrega: string | null
  /** null en recolección. */
  referencias: string | null
  /** null si no se capturaron. */
  observaciones: string | null
  productos: ProductoRegistroPedido[]
  /** Totales del resumen. */
  totalKg: number
  total: number
}

export interface RespuestaRegistroPedido {
  /** Folio asignado: "#" y el Id que regresa la API, p. ej. "#57". */
  folio: string
}

/** Pedido registrado, tal como lo devuelve la consulta de pedidos. */
export interface Pedido {
  id: number
  idCliente: number
  idSucursal: number
  /** Fecha de registro, aaaa-mm-dd (la API no guarda la hora); vacía si la API trae una fecha no válida. */
  fechaRegistro: string
  totalKg: number
  total: number
  /** Ver controladores/estadosPedido.ts. */
  estatus: number
  /** Texto tal como viene; leerObservaciones() separa los datos de entrega de las notas. */
  observaciones: string
  lineas: LineaPedido[]
}

/** Producto dentro de un pedido registrado. */
export interface LineaPedido {
  id: number
  codigoProducto: number | null
  talla: string
  cantidadKg: number
  precioKg: number
  subtotal: number
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
  /** Nombre de la sucursal elegida. */
  sucursal: string | null
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
