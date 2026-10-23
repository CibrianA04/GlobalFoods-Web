<script setup lang="ts">
import { ref, watch } from 'vue'
import logo from '@/recursos/logo-transparente.png'
import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'

interface Props {
  mostrar: boolean
  sucursalEditar?: any | null 
}

const props = withDefaults(defineProps<Props>(), {
  mostrar: false,
  sucursalEditar: null
})

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', datos: { nombreSucursal: string; direccion: string; telefono: string }): void
}>()

const nombreSucursal = ref('')
const direccion = ref('')
const telefono = ref('')
const confirmacionDatos = ref(false)

watch(() => props.sucursalEditar, (nuevaSucursal) => {
  if (nuevaSucursal) {
    nombreSucursal.value = nuevaSucursal.NombreSucursal || ''
    direccion.value = nuevaSucursal.Direccion || ''
    telefono.value = nuevaSucursal.Telefono || ''
    confirmacionDatos.value = false 
  } else {
    nombreSucursal.value = ''
    direccion.value = ''
    telefono.value = ''
    confirmacionDatos.value = false
  }
}, { immediate: true })

const handleGuardar = () => {
  emit('guardar', {
    nombreSucursal: nombreSucursal.value,
    direccion: direccion.value,
    telefono: telefono.value,
  })
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="mostrar" class="overlay" @click.self="emit('cerrar')">
      <div class="modal">
        <div class="modal__logo-wrap">
          <img :src="logo" alt="Global Foods México" class="modal__logo" />
        </div>
        <div class="modal__caja">
          <form @submit.prevent="handleGuardar" class="modal__form">
            <CampoTextoVue id="sucursal-nombre" v-model="nombreSucursal" etiqueta="Nombre de Sucursal" marcador="Ej. Las Quintas" />
            <CampoTextoVue id="sucursal-direccion" v-model="direccion" etiqueta="Dirección" marcador="Dirección completa" />
            <CampoTextoVue id="sucursal-telefono" v-model="telefono" etiqueta="Teléfono" tipo="tel" marcador="Teléfono" />

            <label class="modal__confirmacion">
              <input type="checkbox" v-model="confirmacionDatos" class="modal__confirmacion-input" />
              <span class="modal__confirmacion-texto">Confirmo que los datos ingresados son correctos</span>
            </label>

            <div class="modal__boton-wrap">
              <BotonVue tipo="submit" variante="primario" :deshabilitado="!confirmacionDatos">
                {{ sucursalEditar ? 'Guardar Cambios' : 'Registrar Sucursal' }}
              </BotonVue>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 999; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px); padding: 16px; }
.modal { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 440px; padding: 32px 24px; border-radius: 16px; background: var(--gf-superficie); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
.modal__logo-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
.modal__logo { height: 48px; object-fit: contain; }
.modal__caja { width: 100%; padding: 24px; border: 1px solid var(--gf-borde); border-radius: 12px; background: var(--gf-superficie); }
.modal__form { display: flex; flex-direction: column; gap: 16px; }
.modal__confirmacion { display: flex; align-items: center; gap: 12px; margin-top: 4px; padding: 12px 14px; background-color: var(--gf-fondo); border: 1px solid var(--gf-borde); border-radius: 8px; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease; }
.modal__confirmacion:hover { border-color: var(--gf-primario); background-color: color-mix(in srgb, var(--gf-fondo) 80%, var(--gf-primario)); }
.modal__confirmacion-input { width: 18px; height: 18px; accent-color: var(--gf-primario); cursor: pointer; }
.modal__confirmacion-texto { font-size: 13.5px; color: var(--gf-texto); font-weight: 500; user-select: none; }
.modal__boton-wrap { margin-top: 8px; }
</style>