<script lang="ts">
// Modales abiertos, del más antiguo al más reciente. Solo el último responde a Escape,
// y el resto de la aplicación queda inerte mientras haya al menos uno.
const modalesAbiertos: symbol[] = []

function actualizarInerte() {
  const aplicacion = document.getElementById('app')
  if (!aplicacion) return
  aplicacion.toggleAttribute('inert', modalesAbiertos.length > 0)
}

const SELECTOR_ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export interface Props {
  mostrar: boolean
  /** Título visible; también es el nombre accesible del diálogo. */
  titulo: string
  /** Ancho máximo de la tarjeta, en píxeles. */
  anchoMaximo?: number
  /** Con false, ni Escape, ni el velo, ni la X lo cierran (por ejemplo, mientras se envía algo). */
  cerrable?: boolean
  /** Muestra la X en la esquina. */
  botonCerrar?: boolean
  /** Id del elemento que recibe el foco al cerrar, en lugar del que abrió el modal. */
  enfocarAlCerrar?: string
}
</script>

<script setup lang="ts">
// Diálogo modal base: velo, tarjeta con título y caja con borde (el estilo de ModalNuevoCliente).
// Accesibilidad: role="dialog" + aria-modal, se cierra con Escape, el foco no sale del
// diálogo mientras está abierto y, al cerrarlo, regresa al elemento que lo abrió.
// El foco inicial va al elemento con `data-autofocus` o, si no hay, al primero enfocable.

import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import IconoVue from '@/componentes/IconoVue.vue'

const props = withDefaults(defineProps<Props>(), {
  anchoMaximo: 480,
  cerrable: true,
  botonCerrar: true,
  enfocarAlCerrar: undefined,
})

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const idTitulo = `modal-titulo-${useId()}`
const marca = Symbol('modal')
const dialogo = ref<HTMLElement | null>(null)
let enfocadoAntes: HTMLElement | null = null
let presionadoEnVelo = false

function pedirCierre() {
  if (props.cerrable) emit('cerrar')
}

function enfocables(): HTMLElement[] {
  if (!dialogo.value) return []
  return [...dialogo.value.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES)].filter(
    (elemento) => elemento.offsetParent !== null || elemento === document.activeElement,
  )
}

function enfocarInicial() {
  const preferido = dialogo.value?.querySelector<HTMLElement>('[data-autofocus]')
  const destino = preferido && !preferido.matches(':disabled') ? preferido : enfocables()[0]
  ;(destino ?? dialogo.value)?.focus()
}

function alPresionarTecla(evento: KeyboardEvent) {
  if (modalesAbiertos[modalesAbiertos.length - 1] !== marca) return

  if (evento.key === 'Escape') {
    evento.preventDefault()
    pedirCierre()
    return
  }

  if (evento.key !== 'Tab') return

  // Trampa de foco: de la última opción regresa a la primera y viceversa.
  const lista = enfocables()
  const primero = lista[0]
  const ultimo = lista[lista.length - 1]
  if (!primero || !ultimo) {
    evento.preventDefault()
    return
  }

  const activo = document.activeElement
  const fuera = !dialogo.value?.contains(activo)
  if (evento.shiftKey && (activo === primero || fuera)) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && (activo === ultimo || fuera)) {
    evento.preventDefault()
    primero.focus()
  }
}

function abrir() {
  if (modalesAbiertos.includes(marca)) return
  enfocadoAntes = document.activeElement instanceof HTMLElement ? document.activeElement : null
  modalesAbiertos.push(marca)
  actualizarInerte()
  document.addEventListener('keydown', alPresionarTecla)
  nextTick(enfocarInicial)
}

function cerrarInterno() {
  const indice = modalesAbiertos.indexOf(marca)
  if (indice === -1) return
  modalesAbiertos.splice(indice, 1)
  actualizarInerte()
  document.removeEventListener('keydown', alPresionarTecla)

  // Se devuelve el foco después de quitar `inert`, y solo si el elemento sigue en la página.
  const anterior = enfocadoAntes
  const idDestino = props.enfocarAlCerrar
  enfocadoAntes = null
  nextTick(() => {
    const destino = idDestino ? document.getElementById(idDestino) : anterior
    if (destino?.isConnected) destino.focus()
  })
}

watch(
  () => props.mostrar,
  (visible) => (visible ? abrir() : cerrarInterno()),
  { immediate: true },
)

onBeforeUnmount(cerrarInterno)

function alPresionarVelo(evento: MouseEvent) {
  presionadoEnVelo = evento.target === evento.currentTarget
}

// Solo cierra si el clic empezó y terminó en el velo (no al soltar un arrastre que empezó dentro).
function alSoltarEnVelo(evento: MouseEvent) {
  if (presionadoEnVelo && evento.target === evento.currentTarget) pedirCierre()
  presionadoEnVelo = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="mostrar" class="modal-velo" @mousedown="alPresionarVelo" @click="alSoltarEnVelo">
        <div
          ref="dialogo"
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="idTitulo"
          tabindex="-1"
          :style="{ maxWidth: `${anchoMaximo}px` }"
        >
          <header class="modal__encabezado">
            <h2 :id="idTitulo" class="modal__titulo">{{ titulo }}</h2>
            <button
              v-if="botonCerrar"
              type="button"
              class="modal__cerrar"
              aria-label="Cerrar"
              :disabled="!cerrable"
              @click="pedirCierre"
            >
              <IconoVue nombre="cerrar" :tamano="18" />
            </button>
          </header>

          <div class="modal__caja">
            <slot />
          </div>

          <footer v-if="$slots.pie" class="modal__pie">
            <slot name="pie" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-velo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: color-mix(in srgb, var(--gf-texto) 40%, transparent);
  backdrop-filter: blur(2px);
}

.modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-height: calc(100dvh - 32px);
  padding: 24px;
  border-radius: 16px;
  background: var(--gf-superficie);
  box-shadow: 0 10px 25px color-mix(in srgb, var(--gf-primario) 15%, transparent);
  outline: none;
}

.modal__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal__titulo {
  margin: 0;
  color: var(--gf-texto);
  font-size: 18px;
  font-weight: 700;
}

.modal__cerrar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--gf-texto-tenue);
  cursor: pointer;
}

.modal__cerrar:hover:not(:disabled) {
  background: var(--gf-fondo);
}

.modal__cerrar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal__cerrar:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

/* Caja con borde, como en ModalNuevoCliente. Si el contenido es largo, se desplaza aquí. */
.modal__caja {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  border: 1px solid var(--gf-borde);
  border-radius: 12px;
  background: var(--gf-superficie);
}

.modal__pie {
  display: flex;
  gap: 12px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 560px) {
  .modal {
    padding: 16px;
  }

  .modal__caja {
    padding: 16px;
  }

  .modal__pie {
    flex-direction: column-reverse;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}
</style>
