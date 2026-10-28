<script setup lang="ts">
// Sucursal del cliente elegido: a cuál de sus sucursales activas va el pedido.
// Con una sola sucursal llega ya seleccionada; con varias, la asesora elige en la lista.

import { computed } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import { IDS_CAMPOS, MENSAJES } from '@/modulos/ventas/controladores/usarNuevoPedido'
import type { SucursalCliente } from '@/modulos/ventas/interfaces/cliente'

interface Props {
  /** Sucursales activas del cliente. */
  sucursales: SucursalCliente[]
  cargando?: boolean
  /** Falló la consulta de sucursales. */
  errorConsulta?: boolean
  /** Error de validación al intentar registrar. */
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  cargando: false,
  errorConsulta: false,
  error: '',
})

const emit = defineEmits<{
  (e: 'reintentar'): void
}>()

const sucursal = defineModel<SucursalCliente | null>({ required: true })

/** La consulta ya respondió y el cliente no tiene sucursales activas. */
const sinSucursales = computed(() => !props.cargando && !props.errorConsulta && props.sucursales.length === 0)

/** Solo hay lista para elegir cuando tiene varias; con una, ya viene seleccionada. */
const hayLista = computed(() => !props.cargando && props.sucursales.length > 1)
</script>

<template>
  <div class="sucursal">
    <label v-if="hayLista" class="sucursal__etiqueta" :for="IDS_CAMPOS.sucursal">
      Sucursal<span class="sucursal__obligatorio" aria-hidden="true"> *</span>
    </label>
    <p v-else class="sucursal__etiqueta">Sucursal<span class="sucursal__obligatorio" aria-hidden="true"> *</span></p>

    <p v-if="cargando" class="sucursal__estado" role="status">Cargando sucursales…</p>

    <div v-else-if="errorConsulta" class="sucursal__alerta">
      <IconoVue nombre="alerta" :tamano="18" />
      <span class="sucursal__alerta-texto">No fue posible consultar las sucursales.</span>
      <BotonVue variante="secundario" compacto @click="emit('reintentar')">Reintentar</BotonVue>
    </div>

    <!-- Recibe el foco si se intenta registrar: sin sucursales no se puede. -->
    <p v-else-if="sinSucursales" :id="IDS_CAMPOS.errorSucursal" class="sucursal__alerta" role="alert" tabindex="-1">
      <IconoVue nombre="alerta" :tamano="18" />
      {{ MENSAJES.sinSucursales }}
    </p>

    <template v-else>
      <select
        v-if="hayLista"
        :id="IDS_CAMPOS.sucursal"
        v-model="sucursal"
        class="sucursal__lista"
        :class="{ 'sucursal__lista--con-error': !!error }"
        aria-required="true"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? IDS_CAMPOS.errorSucursal : undefined"
      >
        <option :value="null" disabled>Seleccione una sucursal</option>
        <option v-for="opcion in sucursales" :key="opcion.id" :value="opcion">{{ opcion.nombre }}</option>
      </select>

      <div v-if="sucursal" class="sucursal__detalle">
        <p class="sucursal__nombre">{{ sucursal.nombre }}</p>
        <p class="sucursal__texto">{{ sucursal.direccion ?? 'Sin dirección registrada' }}</p>
        <p v-if="sucursal.telefono" class="sucursal__texto">Tel. {{ sucursal.telefono }}</p>
      </div>
    </template>

    <!-- Sin sucursales, el aviso de arriba ya lo explica. -->
    <p v-if="error && !sinSucursales" :id="IDS_CAMPOS.errorSucursal" class="sucursal__error" tabindex="-1">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.sucursal {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
}

.sucursal :where(p) {
  margin: 0;
}

.sucursal__etiqueta {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 500;
}

.sucursal__obligatorio {
  color: var(--gf-cancelado-punto);
}

.sucursal__estado {
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.sucursal__lista {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--gf-borde);
  border-radius: 8px;
  background: var(--gf-campo-fondo);
  color: var(--gf-texto);
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.sucursal__lista:focus {
  border-color: var(--gf-secundario);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-secundario) 22%, transparent);
}

.sucursal__lista--con-error {
  border-color: var(--gf-cancelado-punto);
}

.sucursal__lista--con-error:focus {
  border-color: var(--gf-cancelado-punto);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-cancelado-punto) 22%, transparent);
}

.sucursal__detalle {
  padding: 10px 12px;
  border: 1px solid var(--gf-borde);
  border-radius: 8px;
  background: var(--gf-fondo);
}

.sucursal__nombre {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 600;
}

.sucursal__texto {
  margin-top: 2px;
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.sucursal__alerta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--gf-preparacion-punto) 45%, transparent);
  border-radius: 8px;
  background: var(--gf-preparacion-bg);
  color: var(--gf-preparacion-fg);
  font-size: 14px;
  font-weight: 500;
}

.sucursal__alerta-texto {
  flex: 1;
}

.sucursal__error {
  color: var(--gf-cancelado-punto);
  font-size: 13px;
}

.sucursal__alerta:focus,
.sucursal__error:focus {
  outline: none;
}
</style>
