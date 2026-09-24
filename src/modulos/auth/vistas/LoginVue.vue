<script setup lang="ts">
import { ref } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import camarones from '@/assets/CamaronesLogin.jpg'
import logo from '@/assets/logo-transparente.png'

// Pantalla estática
const usuario = ref('')
const contrasenia = ref('')
</script>

<template>
  <div class="login">
    <div class="login__foto">
      <img :src="camarones" alt="" class="login__imagen" />
    </div>

    <div class="login__panel">
      <div class="login__contenido">
        <img :src="logo" alt="Global Foods México" class="login__logo" />

        <form class="login__formulario" @submit.prevent>
          <CampoTextoVue
            id="usuario"
            v-model="usuario"
            etiqueta="Usuario"
            marcador="Usuario"
            icono="usuario"
            autocomplete="username"
          />

          <CampoTextoVue
            id="contrasenia"
            v-model="contrasenia"
            etiqueta="Contraseña"
            tipo="password"
            icono="candado"
            autocomplete="current-password"
          >
            <template #accion>
              <button type="button" class="login__enlace login__enlace--chico">
                ¿Olvidó su contraseña?
              </button>
            </template>
          </CampoTextoVue>

          <BotonVue tipo="submit" variante="primario" class="login__boton">Ingresar</BotonVue>
        </form>

        <p class="login__registro">
          <span class="login__registro-texto">¿Nuevo usuario?</span>
          <button type="button" class="login__enlace login__enlace--fuerte">
            Regístrate aquí.
          </button>
        </p>
      </div>

      <footer class="login__pie">
        <button type="button" class="login__enlace login__enlace--pie">
          Términos y Condiciones
        </button>
        <span class="login__separador" aria-hidden="true">|</span>
        <button type="button" class="login__enlace login__enlace--pie">
          Política de Privacidad
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
}

.login__foto {
  overflow: hidden;
}

.login__imagen {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login__panel {
  display: flex;
  flex-direction: column;
  padding: 32px 24px 24px;
  background: var(--gf-superficie);
}


.login__contenido {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.login__logo {
  display: block;
  width: 210px;
  max-width: 100%;
  margin: 0 auto 40px;
}

.login__formulario {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login__boton {
  margin-top: 6px;
}

.login__registro {
  margin: 40px 0 0;
  font-size: 13px;
  text-align: center;
}

.login__registro-texto {
  color: var(--gf-secundario);
}

.login__pie {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 24px;
  font-size: 11px;
  color: var(--gf-texto-tenue);
}

.login__separador {
  color: var(--gf-borde);
}

.login__enlace {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--gf-secundario);
  cursor: pointer;
}

.login__enlace:hover {
  text-decoration: underline;
}

.login__enlace:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
  border-radius: 2px;
}

.login__enlace--chico {
  font-size: 12px;
}

.login__enlace--fuerte {
  margin-left: 4px;
  font-weight: 700;
  color: var(--gf-primario);
}

.login__enlace--pie {
  font-size: 11px;
  color: inherit;
}

@media (max-width: 860px) {
  .login {
    grid-template-columns: 1fr;
  }

  .login__foto {
    display: none;
  }
}
</style>
