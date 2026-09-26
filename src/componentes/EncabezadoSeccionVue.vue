<script setup lang="ts">
// Título de sección con icono. 

import IconoVue, { type NombreIcono } from '@/componentes/IconoVue.vue'

interface Props {
  titulo: string
  icono: NombreIcono
}

defineProps<Props>()
</script>

<template>
  <div class="seccion">
    <h2 class="seccion__titulo">
      <IconoVue :nombre="icono" :tamano="18" />
      {{ titulo }}
    </h2>

    <div v-if="$slots.default" class="seccion__accion">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.seccion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.seccion__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--gf-texto);
  font-size: 16px;
  font-weight: 700;
}

.seccion__accion {
  flex: none;
  font-size: 13px;
}
</style>
