import type { EstadoPedido } from '@/componentes/ChipEstadoVue.vue'

// Traducción del Estatus de la API a lo que se ve en pantalla. Si cambian los nombres o se
// agregan estados (p. ej. Cancelado), se ajusta solo aquí.

/** Estatus de pedido que maneja la API (confirmados por el backend). */
export const ESTATUS = {
  creado: 1,
  surtido: 2,
  enReparto: 3,
  completado: 4,
} as const

/** Cómo se muestra un estatus. */
export interface EstadoPantalla {
  estatus: number
  /** Texto del estado; va en la prop `etiqueta` de ChipEstadoVue. */
  etiqueta: string
  /** Estilo (colores) de ChipEstadoVue. */
  chip: EstadoPedido
  /** Color del punto en los filtros y en la barra de avance. */
  colorPunto: string
}

/** Estados conocidos, en el orden del proceso. */
export const ESTADOS_PEDIDO: EstadoPantalla[] = [
  { estatus: ESTATUS.creado, etiqueta: 'Pendiente', chip: 'pendiente', colorPunto: 'var(--gf-pendiente-punto)' },
  { estatus: ESTATUS.surtido, etiqueta: 'Surtido', chip: 'listo', colorPunto: 'var(--gf-listo-punto)' },
  { estatus: ESTATUS.enReparto, etiqueta: 'En reparto', chip: 'en_reparto', colorPunto: 'var(--gf-reparto-punto)' },
  { estatus: ESTATUS.completado, etiqueta: 'Entregado', chip: 'entregado', colorPunto: 'var(--gf-entregado-punto)' },
]

/** Estado de pantalla de un estatus. Uno desconocido se muestra como "Estado {n}" con el estilo de pendiente. */
export function estadoDePedido(estatus: number): EstadoPantalla {
  return (
    ESTADOS_PEDIDO.find((estado) => estado.estatus === estatus) ?? {
      estatus,
      etiqueta: `Estado ${estatus}`,
      chip: 'pendiente',
      colorPunto: 'var(--gf-pendiente-punto)',
    }
  )
}
