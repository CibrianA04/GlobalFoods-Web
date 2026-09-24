<script setup lang="ts">
// Botón reutilizable.
// El texto va siempre por el slot por defecto, así el componente
// no trae ninguna palabra propia de una pantalla concreta.

interface Props {
  /** Tipo nativo del botón. */
  tipo?: 'button' | 'submit'
  /** Apariencia: relleno de marca o versión discreta sobre fondo claro. */
  variante?: 'primario' | 'secundario'
  deshabilitado?: boolean
  /** Muestra un girador y bloquea el botón mientras dura una operación. */
  cargando?: boolean
}

withDefaults(defineProps<Props>(), {
  tipo: 'button',
  variante: 'primario',
  deshabilitado: false,
  cargando: false,
})
</script>

<template>
  <button
    class="boton"
    :class="`boton--${variante}`"
    :type="tipo"
    :disabled="deshabilitado || cargando"
    :aria-busy="cargando || undefined"
  >
    <span v-if="cargando" class="boton__girador" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.boton:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.boton--primario {
  background: var(--gf-primario);
  color: var(--gf-superficie);
}

.boton--primario:hover:not(:disabled) {
  background: color-mix(in srgb, var(--gf-primario) 85%, var(--gf-texto));
}

.boton--secundario {
  background: var(--gf-superficie);
  border-color: var(--gf-borde);
  color: var(--gf-primario);
}

.boton--secundario:hover:not(:disabled) {
  background: var(--gf-fondo);
}

.boton__girador {
  flex: none;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: boton-giro 0.7s linear infinite;
}

@keyframes boton-giro {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .boton__girador {
    animation-duration: 2s;
  }
}
</style>
