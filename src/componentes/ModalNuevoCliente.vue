<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/recursos/logo-transparente.png'
import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'

interface Props {
  mostrar: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', datos: { nombre: string; celular: string; usuario: string; contrasena: string }): void
}>()

const nombre = ref('')
const celular = ref('')
const usuario = ref('')
const contrasena = ref('')
const aceptoTerminos = ref(false)

const handleGuardar = () => {
  emit('guardar', {
    nombre: nombre.value,
    celular: celular.value,
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
          <form @submit.prevent="handleGuardar" class="modal__form">
            <CampoTextoVue
              id="cliente-nombre"
              v-model="nombre"
              etiqueta="Nombre"
              marcador="Nombre completo"
            />

            <CampoTextoVue
              id="cliente-celular"
              v-model="celular"
              etiqueta="Celular"
              tipo="tel"
              marcador="+52 000 000 0000"
            />

            <CampoTextoVue
              id="cliente-usuario"
              v-model="usuario"
              etiqueta="Usuario"
              tipo="text"
              marcador="Usuario"
            />

            <CampoTextoVue
              id="cliente-contrasena"
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
                Registrar
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