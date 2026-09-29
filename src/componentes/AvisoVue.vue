<script setup lang="ts">
// Mensaje emergente que se cierra solo.
// El texto se controla con v-model: con texto se muestra, vacío se oculta.
// El cierre automático se pausa mientras el puntero o el foco están sobre el aviso.

import { onBeforeUnmount, watch } from 'vue'

import IconoVue from '@/componentes/IconoVue.vue'

interface Props {
  /** Color e icono: error (rojo), éxito (verde) o información (azul). */
  variante?: 'error' | 'exito' | 'info'
  /** Milisegundos antes de cerrarse solo. Con 0 solo se cierra con la X. */
  duracion?: number
}

const props = withDefaults(defineProps<Props>(), {
  variante: 'error',
  duracion: 6000,
})

const mensaje = defineModel<string>({ default: '' })

let temporizador: ReturnType<typeof setTimeout> | undefined
let pausado = false

function programarCierre() {
  clearTimeout(temporizador)
  if (!mensaje.value || !props.duracion || pausado) return
  temporizador = setTimeout(cerrar, props.duracion)
}

function pausar() {
  pausado = true
  clearTimeout(temporizador)
}

function reanudar() {
  pausado = false
  programarCierre()
}

function cerrar() {
  clearTimeout(temporizador)
  pausado = false
  mensaje.value = ''
}

watch(mensaje, programarCierre, { immediate: true })
onBeforeUnmount(() => clearTimeout(temporizador))
</script>

<template>
  <Teleport to="body">
    <Transition name="aviso">
      <div
        v-if="mensaje"
        class="aviso"
        :class="`aviso--${variante}`"
        @mouseenter="pausar"
        @mouseleave="reanudar"
        @focusin="pausar"
        @focusout="reanudar"
      >
        <IconoVue :nombre="variante === 'exito' ? 'check' : 'alerta'" :tamano="18" />
        <p class="aviso__texto" role="alert">{{ mensaje }}</p>
        <button type="button" class="aviso__cerrar" aria-label="Cerrar aviso" @click="cerrar">
          <IconoVue nombre="cerrar" :tamano="16" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Arriba a la derecha, debajo del encabezado del panel y por encima de los modales. */
.aviso {
  --aviso-fondo: var(--gf-cancelado-bg);
  --aviso-texto: var(--gf-cancelado-fg);
  --aviso-borde: var(--gf-cancelado-punto);

  position: fixed;
  top: 76px;
  right: 24px;
  z-index: 1100;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: min(420px, calc(100% - 32px));
  padding: 12px 12px 12px 14px;
  border: 1px solid color-mix(in srgb, var(--aviso-borde) 45%, transparent);
  border-left: 4px solid var(--aviso-borde);
  border-radius: 10px;
  background: var(--aviso-fondo);
  color: var(--aviso-texto);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--gf-primario) 16%, transparent);
}

.aviso--exito {
  --aviso-fondo: var(--gf-entregado-bg);
  --aviso-texto: var(--gf-entregado-fg);
  --aviso-borde: var(--gf-entregado-punto);
}

.aviso--info {
  --aviso-fondo: var(--gf-listo-bg);
  --aviso-texto: var(--gf-listo-fg);
  --aviso-borde: var(--gf-listo-punto);
}

.aviso > .icono {
  margin-top: 1px;
}

.aviso__texto {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.aviso__cerrar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
}

.aviso__cerrar:hover {
  background: color-mix(in srgb, var(--aviso-borde) 15%, transparent);
}

.aviso__cerrar:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 1px;
}

.aviso-enter-active,
.aviso-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 560px) {
  .aviso {
    top: 12px;
    right: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aviso-enter-active,
  .aviso-leave-active {
    transition: none;
  }
}
</style>
