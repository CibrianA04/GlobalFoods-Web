<script setup lang="ts">
// Esqueleto común de todas las pantallas del panel:
// encabezado arriba, barra lateral + contenido en una tarjeta en medio y pie abajo.

import BarraLateralVue, { type ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import EncabezadoPanelVue from '@/componentes/EncabezadoPanelVue.vue'
import PiePanelVue from '@/componentes/PiePanelVue.vue'

interface Props {
  titulo: string
  usuario: string
  itemsNavegacion: ItemNavegacion[]
  /** Etiqueta del item de navegación activo. */
  itemActivo?: string
}

withDefaults(defineProps<Props>(), {
  itemActivo: '',
})
</script>

<template>
  <div class="layout">
    <EncabezadoPanelVue :titulo="titulo" :usuario="usuario" />

    <div class="layout__cuerpo">
      <BarraLateralVue :items="itemsNavegacion" :activo="itemActivo" />

      <main class="layout__contenido">
        <slot />
      </main>
    </div>

    <PiePanelVue />
  </div>
</template>

<style scoped>
/* minmax(0, 1fr): la columna no se ensancha con el título del encabezado en móvil. */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--gf-fondo);
}

/* Tarjeta blanca separada del borde; encabezado y pie quedan de lado a lado. */
.layout__cuerpo {
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr);
  margin: 24px;
  overflow: hidden;
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--gf-primario) 8%, transparent);
}

.layout__contenido {
  min-width: 0;
  padding: 28px 32px 40px;
}

@media (max-width: 900px) {
  .layout__cuerpo {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    margin: 12px;
  }

  .layout__contenido {
    padding: 20px 16px 32px;
  }
}
</style>
