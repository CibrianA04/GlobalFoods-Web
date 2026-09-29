<script setup lang="ts">
import { ref, watch } from 'vue'
import logo from '@/recursos/logo-transparente.png'
import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import type { UsuarioAPI } from '@/modulos/administracion/servicios/servicioUsuarios'

type TipoUsuario = 'Administrador' | 'Empleado' | 'Reporte'

interface Props {
  mostrar: boolean
  usuarioEditar?: UsuarioAPI | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', datos: { tipoUsuario: string; nombre: string; usuario: string; contrasena: string }): void
}>()

const tipoSeleccionado = ref<TipoUsuario>('Administrador')
const nombre = ref('')
const usuario = ref('')
const contrasena = ref('')
const aceptoTerminos = ref(false)

// Escuchar cambios en la prop 'usuarioEditar' para precargar los datos o limpiar el formulario
watch(
  () => props.usuarioEditar,
  (nuevoUsuario) => {
    if (nuevoUsuario) {
      nombre.value = nuevoUsuario.Nombre || ''
      usuario.value = nuevoUsuario.Usuario || ''
      contrasena.value = nuevoUsuario.Contraseña || ''
      
      const tipo = nuevoUsuario.TipoUsuario || 'Administrador'
      if (tipo === 'Administrador' || tipo === 'Empleado' || tipo === 'Reporte') {
        tipoSeleccionado.value = tipo
      } else {
        tipoSeleccionado.value = 'Administrador'
      }
      aceptoTerminos.value = true // Al editar, permitir guardar directo
    } else {
      // Limpiar formulario para nuevo registro
      nombre.value = ''
      usuario.value = ''
      contrasena.value = ''
      tipoSeleccionado.value = 'Administrador'
      aceptoTerminos.value = false
    }
  },
  { immediate: true }
)

const handleGuardar = () => {
  emit('guardar', {
    tipoUsuario: tipoSeleccionado.value,
    nombre: nombre.value,
    usuario: usuario.value,
    contrasena: contrasena.value,
  })
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="mostrar" class="overlay" @click.self="emit('cerrar')">
      <div class="modal">
        <!-- Logo -->
        <div class="modal__logo-wrap">
          <img :src="logo" alt="Global Foods México" class="modal__logo" />
        </div>

        <!-- Tarjeta del formulario -->
        <div class="modal__caja">
          <!-- Pestañas de Tipo de Usuario -->
          <div class="modal__tabs">
            <button
              type="button"
              class="modal__tab"
              :class="{ 'modal__tab--activo': tipoSeleccionado === 'Administrador' }"
              @click="tipoSeleccionado = 'Administrador'"
            >
              Admin
            </button>
            <button
              type="button"
              class="modal__tab"
              :class="{ 'modal__tab--activo': tipoSeleccionado === 'Empleado' }"
              @click="tipoSeleccionado = 'Empleado'"
            >
              Empleado
            </button>
            <button
              type="button"
              class="modal__tab"
              :class="{ 'modal__tab--activo': tipoSeleccionado === 'Reporte' }"
              @click="tipoSeleccionado = 'Reporte'"
            >
              Reporte
            </button>
          </div>

          <form @submit.prevent="handleGuardar" class="modal__form">
            <CampoTextoVue
              id="usuario-nombre"
              v-model="nombre"
              etiqueta="Nombre"
              marcador="Nombre completo"
            />

            <CampoTextoVue
              id="usuario-email"
              v-model="usuario"
              etiqueta="Usuario"
              tipo="text"
              marcador="Usuario"
            />

            <CampoTextoVue
              id="usuario-contrasena"
              v-model="contrasena"
              etiqueta="Contraseña"
              tipo="password"
              icono="candado"
              marcador="********"
            />

            <label class="modal__checkbox-label">
              <input type="checkbox" v-model="aceptoTerminos" class="modal__checkbox" />
              <span>Acepto los <a href="#">Términos</a> y <a href="#">Política de Privacidad</a></span>
            </label>

            <div class="modal__boton-wrap">
              <BotonVue tipo="submit" variante="primario" :deshabilitado="!aceptoTerminos">
                {{ usuarioEditar ? 'Guardar Cambios' : 'Registrar' }}
              </BotonVue>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  padding: 16px;
}

.modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  padding: 32px 24px;
  border-radius: 16px;
  background: var(--gf-superficie);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal__logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.modal__logo {
  height: 48px;
  object-fit: contain;
}

.modal__caja {
  width: 100%;
  padding: 24px;
  border: 1px solid var(--gf-borde);
  border-radius: 12px;
  background: var(--gf-superficie);
}

.modal__tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  border-bottom: 1px solid var(--gf-borde);
  margin-bottom: 20px;
  padding-bottom: 8px;
}

.modal__tab {
  position: relative;
  padding: 4px 8px;
  border: 0;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--gf-texto-tenue);
  cursor: pointer;
  transition: color 0.15s ease;
}

.modal__tab:hover {
  color: var(--gf-texto);
}

.modal__tab--activo {
  color: var(--gf-primario);
  font-weight: 700;
}

.modal__tab--activo::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gf-primario);
  border-radius: 2px;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal__checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--gf-texto-tenue);
  cursor: pointer;
  margin-top: 4px;
}

.modal__checkbox-label a {
  color: var(--gf-primario);
  text-decoration: underline;
}

.modal__checkbox {
  accent-color: var(--gf-primario);
}

.modal__boton-wrap {
  margin-top: 8px;
}
</style>