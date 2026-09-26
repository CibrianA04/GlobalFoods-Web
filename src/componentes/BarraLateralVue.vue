<script lang="ts">
import type { NombreIcono } from '@/componentes/IconoVue.vue'

export interface ItemNavegacion {
  etiqueta: string
  icono: NombreIcono
  /** Ruta de destino. */
  ruta?: string
}

export interface Props {
  items: ItemNavegacion[]
  /** Etiqueta del item que se marca como activo. */
  activo?: string
}
</script>

<script setup lang="ts">
// Navegación lateral del panel.
// En pantallas angostas se vuelve una fila horizontal desplazable.

import IconoVue from '@/componentes/IconoVue.vue'

withDefaults(defineProps<Props>(), {
  activo: '',
})
</script>

<template>
  <nav class="barra" aria-label="Navegación principal">
    <ul class="barra__lista">
      <li v-for="item in items" :key="item.etiqueta">
        <RouterLink
          v-if="item.ruta"
          :to="item.ruta"
          class="barra__item"
          :class="{ 'barra__item--activo': item.etiqueta === activo }"
          :aria-current="item.etiqueta === activo ? 'page' : undefined"
        >
          <IconoVue :nombre="item.icono" :tamano="18" />
          <span class="barra__texto">{{ item.etiqueta }}</span>
        </RouterLink>

        <!--cuando exista la pantalla, el item trae `ruta` y se pinta como RouterLink. -->
        <button
          v-else
          type="button"
          class="barra__item"
          :class="{ 'barra__item--activo': item.etiqueta === activo }"
          :aria-current="item.etiqueta === activo ? 'page' : undefined"
        >
          <IconoVue :nombre="item.icono" :tamano="18" />
          <span class="barra__texto">{{ item.etiqueta }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.barra {
  padding: 20px 10px;
  background: var(--gf-superficie);
  border-right: 1px solid var(--gf-borde);
}

.barra__lista {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.barra__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--gf-texto);
  font: inherit;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.barra__item:hover {
  background: var(--gf-fondo);
}

.barra__item:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.barra__item--activo,
.barra__item--activo:hover {
  background: color-mix(in srgb, var(--gf-claro) 22%, var(--gf-superficie));
  color: var(--gf-primario);
  font-weight: 600;
}

/* Marca del item activo, pegada a la derecha. */
.barra__item--activo::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--gf-primario);
  transform: translateY(-50%);
}

.barra__texto {
  white-space: nowrap;
}

@media (max-width: 900px) {
  .barra {
    padding: 8px 12px;
    border-right: 0;
    border-bottom: 1px solid var(--gf-borde);
    overflow-x: auto;
  }

  .barra__lista {
    flex-direction: row;
  }

  .barra__item {
    width: auto;
    padding: 8px 12px;
  }

  /* En fila, la marca del activo pasa abajo. */
  .barra__item--activo::after {
    top: auto;
    right: 12px;
    bottom: 2px;
    left: 12px;
    width: auto;
    height: 3px;
    transform: none;
  }
}
</style>
