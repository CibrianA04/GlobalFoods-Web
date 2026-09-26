<script lang="ts">
export type EstadoPedido =
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'en_reparto'
  | 'entregado'
  | 'cancelado'

export interface Props {
  estado: EstadoPedido
  /** Texto a mostrar en lugar de la etiqueta del estado */
  etiqueta?: string
}
</script>

<script setup lang="ts">
// Chip de estado de un pedido.
// Siempre lleva texto además del color, para no depender solo del color.

import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  etiqueta: '',
})

// Cada estado apunta a su grupo de variables 
const nombreVariable: Record<EstadoPedido, string> = {
  pendiente: 'pendiente',
  en_preparacion: 'preparacion',
  listo: 'listo',
  en_reparto: 'reparto',
  entregado: 'entregado',
  cancelado: 'cancelado',
}

const etiquetaPorEstado: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  en_reparto: 'En reparto',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const texto = computed(() => props.etiqueta || etiquetaPorEstado[props.estado])

const colores = computed(() => {
  const nombre = nombreVariable[props.estado]
  return {
    '--chip-fondo': `var(--gf-${nombre}-bg)`,
    '--chip-texto': `var(--gf-${nombre}-fg)`,
    '--chip-punto': `var(--gf-${nombre}-punto)`,
  }
})
</script>

<template>
  <span class="chip" :style="colores">
    <span class="chip__punto" aria-hidden="true"></span>
    {{ texto }}
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--chip-fondo);
  color: var(--chip-texto);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.chip__punto {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chip-punto);
}
</style>
