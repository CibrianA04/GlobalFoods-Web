<script setup lang="ts">
// Filtros de la lista de pedidos: estado (píldoras con su conteo), búsqueda por folio o cliente
// y rango de la fecha de registro. Las píldoras son botones con aria-pressed; presionar otra vez
// la activa regresa a Todos.

import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import { ESTADOS_PEDIDO } from '@/modulos/ventas/controladores/estadosPedido'
import { IDS_LISTA, type ConteosPedidos } from '@/modulos/ventas/controladores/usarListaPedidos'

interface Props {
  conteos: ConteosPedidos
  /** Error del rango de fechas; se pinta debajo de Desde. */
  errorFechas?: string
  /** Habilita "Limpiar filtros". */
  hayFiltros?: boolean
}

withDefaults(defineProps<Props>(), {
  errorFechas: '',
  hayFiltros: false,
})

const emit = defineEmits<{
  (e: 'limpiar'): void
}>()

/** null = Todos. */
const estatus = defineModel<number | null>('estatus', { required: true })
const criterio = defineModel<string>('criterio', { required: true })
const desde = defineModel<string>('desde', { required: true })
const hasta = defineModel<string>('hasta', { required: true })

function alternar(valor: number) {
  estatus.value = estatus.value === valor ? null : valor
}
</script>

<template>
  <div class="filtros">
    <div class="estados" role="group" aria-label="Filtrar por estado">
      <button type="button" class="estados__boton" :aria-pressed="estatus === null" @click="estatus = null">
        Todos
        <span class="estados__conteo">{{ conteos.todos }}</span>
      </button>
      <button
        v-for="estado in ESTADOS_PEDIDO"
        :key="estado.estatus"
        type="button"
        class="estados__boton"
        :aria-pressed="estatus === estado.estatus"
        @click="alternar(estado.estatus)"
      >
        <span class="estados__punto" :style="{ background: estado.colorPunto }" aria-hidden="true"></span>
        {{ estado.etiqueta }}
        <span class="estados__conteo">{{ conteos.porEstatus[estado.estatus] ?? 0 }}</span>
      </button>
    </div>

    <div class="campos">
      <div class="campos__busqueda">
        <CampoTextoVue
          :id="IDS_LISTA.buscar"
          v-model="criterio"
          etiqueta="Buscar"
          marcador="Folio o nombre del cliente"
          icono="lupa"
          compacto
          autocomplete="off"
        />
      </div>

      <CampoTextoVue
        :id="IDS_LISTA.desde"
        v-model="desde"
        etiqueta="Desde"
        tipo="date"
        compacto
        :max="hasta || undefined"
        :error="errorFechas"
      />

      <CampoTextoVue :id="IDS_LISTA.hasta" v-model="hasta" etiqueta="Hasta" tipo="date" compacto :min="desde || undefined" />

      <div class="campos__accion">
        <!-- Ocupa el alto de una etiqueta para que el botón quede a la altura de los campos. -->
        <span class="campos__hueco" aria-hidden="true">Limpiar</span>
        <BotonVue variante="secundario" :deshabilitado="!hayFiltros" @click="emit('limpiar')">Limpiar filtros</BotonVue>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.estados {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.estados__boton {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px 0 14px;
  border: 1px solid var(--gf-borde);
  border-radius: 999px;
  background: var(--gf-superficie);
  color: var(--gf-texto);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.estados__boton:hover {
  border-color: var(--gf-claro);
}

.estados__boton:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.estados__boton[aria-pressed='true'] {
  border-color: var(--gf-primario);
  background: var(--gf-primario);
  color: var(--gf-superficie);
}

.estados__punto {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.estados__conteo {
  min-width: 22px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--gf-fondo);
  color: var(--gf-texto-tenue);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.estados__boton[aria-pressed='true'] .estados__conteo {
  background: color-mix(in srgb, var(--gf-superficie) 20%, transparent);
  color: var(--gf-superficie);
}

.campos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px 170px auto;
  gap: 12px 16px;
  align-items: start;
}

.campos__accion {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Mismas medidas que la etiqueta compacta de CampoTextoVue. */
.campos__hueco {
  visibility: hidden;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .campos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .campos__busqueda,
  .campos__accion {
    grid-column: 1 / -1;
  }

  .campos__hueco {
    display: none;
  }
}

@media (max-width: 480px) {
  .campos {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
