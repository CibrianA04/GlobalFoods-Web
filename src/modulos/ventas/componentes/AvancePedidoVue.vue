<script setup lang="ts">
// Barra de avance del pedido con los cuatro estados en orden: los anteriores al actual llevan
// palomita, el actual va resaltado con su color y los siguientes quedan vacíos. Sin horas: la API
// no guarda cuándo cambió cada estado. En pantallas angostas los pasos quedan uno debajo de otro.

import { computed } from 'vue'

import IconoVue from '@/componentes/IconoVue.vue'
import { ESTADOS_PEDIDO } from '@/modulos/ventas/controladores/estadosPedido'

interface Props {
  estatus: number
}

const props = defineProps<Props>()

/** -1 si el estatus no es uno de los conocidos: ningún paso queda marcado. */
const indiceActual = computed(() => ESTADOS_PEDIDO.findIndex((estado) => estado.estatus === props.estatus))

function situacion(indice: number): 'hecho' | 'actual' | 'siguiente' {
  if (indice < indiceActual.value) return 'hecho'
  return indice === indiceActual.value ? 'actual' : 'siguiente'
}
</script>

<template>
  <ol class="avance" aria-label="Avance del pedido">
    <li
      v-for="(estado, indice) in ESTADOS_PEDIDO"
      :key="estado.estatus"
      class="avance__paso"
      :class="`avance__paso--${situacion(indice)}`"
      :style="{ '--avance-color': estado.colorPunto }"
      :aria-current="situacion(indice) === 'actual' ? 'step' : undefined"
    >
      <span class="avance__marca" aria-hidden="true">
        <IconoVue v-if="situacion(indice) === 'hecho'" nombre="check" :tamano="14" />
      </span>
      <span class="avance__etiqueta">
        {{ estado.etiqueta }}
        <span v-if="situacion(indice) === 'hecho'" class="visualmente-oculto">(completado)</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.avance {
  display: flex;
  margin: 0;
  padding: 18px 20px;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
  list-style: none;
}

.avance__paso {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

/* Línea hacia el siguiente paso; azul marino si ya se pasó por este. */
.avance__paso:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 13px;
  right: 12px;
  left: 40px;
  height: 2px;
  background: var(--gf-borde);
}

.avance__paso--hecho:not(:last-child)::after {
  background: var(--gf-primario);
}

.avance__marca {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid var(--gf-borde);
  border-radius: 50%;
  background: var(--gf-superficie);
  color: var(--gf-superficie);
}

.avance__paso--hecho .avance__marca {
  border-color: var(--gf-primario);
  background: var(--gf-primario);
}

.avance__paso--actual .avance__marca {
  border-color: var(--avance-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--avance-color) 25%, transparent);
}

.avance__paso--actual .avance__marca::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--avance-color);
}

.avance__etiqueta {
  color: var(--gf-texto-tenue);
  font-size: 13px;
  font-weight: 600;
}

.avance__paso--hecho .avance__etiqueta {
  color: var(--gf-texto);
}

.avance__paso--actual .avance__etiqueta {
  color: var(--gf-texto);
  font-weight: 700;
}

@media (max-width: 560px) {
  .avance {
    flex-direction: column;
    gap: 18px;
  }

  .avance__paso {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .avance__paso:not(:last-child)::after {
    top: 32px;
    right: auto;
    bottom: -14px;
    left: 13px;
    width: 2px;
    height: auto;
  }
}
</style>
