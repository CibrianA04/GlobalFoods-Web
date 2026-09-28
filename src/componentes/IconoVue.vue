<script lang="ts">
/** Iconos disponibles. */
export type NombreIcono =
  | 'inicio'
  | 'pedidos'
  | 'clientes'
  | 'reportes'
  | 'usuario'
  | 'caja'
  | 'reloj'
  | 'engrane'
  | 'salir'
  | 'mas'
  | 'bolsa'
  | 'lapiz'
  | 'basura'

export interface Props {
  nombre: NombreIcono
  /** Lado del icono en píxeles. */
  tamano?: number
}
</script>

<script setup lang="ts">
// Iconos SVG en línea, de trazo, que toman el color del texto (currentColor).
// Son decorativos: el texto accesible lo pone quien los usa.

withDefaults(defineProps<Props>(), {
  tamano: 20,
})
</script>

<template>
  <svg
    class="icono"
    viewBox="0 0 24 24"
    :width="tamano"
    :height="tamano"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="nombre === 'inicio'">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </template>

    <template v-else-if="nombre === 'pedidos'">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3h2.5l2.6 12.2a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L21 7H6" />
    </template>

    <template v-else-if="nombre === 'clientes'">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
      <path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7" />
    </template>

    <template v-else-if="nombre === 'reportes'">
      <path d="M5 20v-6" />
      <path d="M12 20V9" />
      <path d="M19 20V4" />
    </template>

    <template v-else-if="nombre === 'usuario'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </template>

    <template v-else-if="nombre === 'caja'">
      <path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5" />
      <path d="M12 12v9.2" />
      <path d="m7.8 5.2 8.5 4.6" />
    </template>

    <template v-else-if="nombre === 'reloj'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>

    <template v-else-if="nombre === 'engrane'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
      />
    </template>

    <template v-else-if="nombre === 'mas'">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </template>

    <template v-else-if="nombre === 'salir'">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </template>

    <template v-else-if="nombre === 'bolsa'">
      <path d="M5 7h14l-1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </template>
    
    <template v-else-if="nombre === 'lapiz'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </template>

    <template v-else-if="nombre === 'basura'">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </template>
  </svg>
</template>

<style scoped>
.icono {
  display: block;
  flex: none;
}
</style>
