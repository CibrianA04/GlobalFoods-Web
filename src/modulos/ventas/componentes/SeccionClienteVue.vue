<script setup lang="ts">
// Paso 1 del pedido: buscar y elegir un cliente registrado.
// El buscador sigue el patrón combobox con lista: flechas para recorrer, Enter para elegir y
// Escape para cerrar la lista.

import { nextTick, reactive, watch } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import { formatearFecha, inicialesCliente } from '@/modulos/ventas/controladores/formatosPedido'
import { usarBuscadorClientes } from '@/modulos/ventas/controladores/usarBuscadorClientes'
import { IDS_CAMPOS } from '@/modulos/ventas/controladores/usarNuevoPedido'
import type { Cliente } from '@/modulos/ventas/interfaces/cliente'

interface Props {
  error?: string
}

withDefaults(defineProps<Props>(), {
  error: '',
})

const emit = defineEmits<{
  (e: 'errorBusqueda'): void
}>()

const cliente = defineModel<Cliente | null>({ required: true })

const buscador = reactive(usarBuscadorClientes({ alFallar: () => emit('errorBusqueda') }))

const ID_LISTA = 'pedido-cliente-resultados'
const ID_CAMBIAR = 'pedido-cliente-cambiar'
const ID_SELECCIONADO = 'pedido-cliente-seleccionado'
const idOpcion = (indice: number) => `pedido-cliente-opcion-${indice}`

// La opción activa siempre queda a la vista dentro de la lista.
watch(
  () => buscador.indiceActivo,
  (indice) => {
    if (indice >= 0) nextTick(() => document.getElementById(idOpcion(indice))?.scrollIntoView({ block: 'nearest' }))
  },
)

async function seleccionar(elegido: Cliente) {
  cliente.value = elegido
  buscador.limpiar()
  await nextTick()
  document.getElementById(ID_CAMBIAR)?.focus()
}

async function cambiar() {
  cliente.value = null
  await nextTick()
  document.getElementById(IDS_CAMPOS.cliente)?.focus()
}

function alPresionarTecla(evento: KeyboardEvent) {
  switch (evento.key) {
    case 'ArrowDown':
      evento.preventDefault()
      buscador.moverActivo(1)
      break
    case 'ArrowUp':
      evento.preventDefault()
      buscador.moverActivo(-1)
      break
    case 'Enter': {
      const activo = buscador.listaAbierta ? buscador.resultados[buscador.indiceActivo] : undefined
      if (activo) {
        evento.preventDefault()
        seleccionar(activo)
      }
      break
    }
    case 'Escape':
      if (buscador.listaAbierta) {
        evento.preventDefault()
        buscador.cerrarLista()
      }
      break
  }
}
</script>

<template>
  <section>
    <EncabezadoSeccionVue :paso="1" titulo="Cliente" icono="clientes" />

    <div v-if="!cliente" class="buscador">
      <CampoTextoVue
        :id="IDS_CAMPOS.cliente"
        v-model="buscador.criterio"
        etiqueta="Buscar cliente"
        marcador="Nombre, razón social o teléfono (mínimo 3 caracteres)"
        icono="lupa"
        obligatorio
        compacto
        :error="error"
        :ayuda="buscador.mensajeAyuda"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="buscador.listaAbierta"
        :aria-controls="ID_LISTA"
        :aria-activedescendant="buscador.indiceActivo >= 0 ? idOpcion(buscador.indiceActivo) : undefined"
        @keydown="alPresionarTecla"
        @focus="buscador.abrirLista()"
        @blur="buscador.cerrarLista()"
      />

      <ul
        v-show="buscador.listaAbierta"
        :id="ID_LISTA"
        class="buscador__lista"
        role="listbox"
        aria-label="Clientes encontrados"
      >
        <!-- mousedown.prevent: el campo no pierde el foco antes del clic. -->
        <li
          v-for="(resultado, indice) in buscador.resultados"
          :id="idOpcion(indice)"
          :key="resultado.id"
          class="buscador__opcion"
          :class="{ 'buscador__opcion--activa': indice === buscador.indiceActivo }"
          role="option"
          :aria-selected="indice === buscador.indiceActivo"
          @mousedown.prevent
          @mousemove="buscador.indiceActivo = indice"
          @click="seleccionar(resultado)"
        >
          <span class="buscador__nombre">{{ resultado.nombre }}</span>
          <span class="buscador__detalle">
            {{ resultado.telefono }}
            <template v-if="resultado.razonSocial"> · {{ resultado.razonSocial }}</template>
          </span>
        </li>
      </ul>
    </div>

    <div v-else class="tarjeta-cliente">
      <span class="tarjeta-cliente__iniciales" aria-hidden="true">{{ inicialesCliente(cliente.nombre) }}</span>

      <div :id="ID_SELECCIONADO" class="tarjeta-cliente__datos">
        <p class="tarjeta-cliente__nombre">
          {{ cliente.nombre }}
          <IconoVue nombre="check" :tamano="16" class="tarjeta-cliente__check" />
          <span class="visualmente-oculto">(cliente seleccionado)</span>
        </p>
        <p class="tarjeta-cliente__detalle">
          {{ cliente.telefono }} · {{ cliente.direccion ?? 'Sin dirección registrada' }}
        </p>
        <p class="tarjeta-cliente__ultimo">
          {{ cliente.ultimoPedido ? `Último pedido: ${formatearFecha(cliente.ultimoPedido)}` : 'Sin pedidos previos' }}
        </p>
      </div>

      <div class="tarjeta-cliente__accion">
        <BotonVue
          :id="ID_CAMBIAR"
          variante="secundario"
          compacto
          aria-label="Cambiar cliente"
          :aria-describedby="ID_SELECCIONADO"
          @click="cambiar"
        >
          Cambiar
        </BotonVue>
      </div>
    </div>

    <p class="seccion-cliente__nota">
      ¿Cliente nuevo? Solicita su alta en el sistema interno; aquí solo se consultan clientes registrados.
    </p>
  </section>
</template>

<style scoped>
.buscador {
  position: relative;
}

.buscador__lista {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 5;
  max-height: 280px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  border: 1px solid var(--gf-borde);
  border-radius: 8px;
  background: var(--gf-superficie);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--gf-primario) 14%, transparent);
  list-style: none;
}

.buscador__opcion {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.buscador__opcion--activa {
  background: color-mix(in srgb, var(--gf-claro) 22%, var(--gf-superficie));
}

.buscador__nombre {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 600;
}

.buscador__detalle {
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.tarjeta-cliente {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--gf-claro);
  border-radius: 10px;
  background: color-mix(in srgb, var(--gf-claro) 10%, var(--gf-superficie));
}

.tarjeta-cliente__iniciales {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--gf-claro) 30%, var(--gf-superficie));
  color: var(--gf-primario);
  font-size: 14px;
  font-weight: 700;
}

.tarjeta-cliente__datos {
  flex: 1;
  min-width: 0;
}

.tarjeta-cliente__datos :where(p) {
  margin: 0;
}

.tarjeta-cliente__nombre {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 700;
}

.tarjeta-cliente__check {
  color: var(--gf-entregado-punto);
}

.tarjeta-cliente__detalle {
  margin-top: 2px;
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.tarjeta-cliente__ultimo {
  margin-top: 2px;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.tarjeta-cliente__accion {
  flex: none;
}

.seccion-cliente__nota {
  margin: 12px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

@media (max-width: 560px) {
  .tarjeta-cliente {
    flex-wrap: wrap;
  }

  .tarjeta-cliente__accion {
    width: 100%;
  }
}
</style>
