<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import imagenCamarones from '@/recursos/CamaronesInicioSesion.jpg'
import logotipo from '@/recursos/logo-transparente.png'
import {
  guardarToken,
  iniciarSesionUsuario,
} from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const enrutador = useRouter()
const usuario = ref('')
const contrasena = ref('')
const cargando = ref(false)
const error = ref('')

const iniciarSesion = async () => {
  error.value = ''

  const usuarioLimpio = usuario.value.trim()
  const contrasenaLimpia = contrasena.value.trim()

  if (!usuarioLimpio || !contrasenaLimpia) {
    error.value = 'Ingresa tu usuario y contraseña.'
    return
  }

  cargando.value = true

  try {
    const respuestaInicioSesion = await iniciarSesionUsuario(usuarioLimpio, contrasenaLimpia)
    guardarToken(respuestaInicioSesion.accessToken, respuestaInicioSesion.nombre)
    enrutador.push('/panel')
  } catch (errorCapturado) {
    error.value = errorCapturado instanceof Error ? errorCapturado.message : 'No se pudo iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="inicio-sesion">
    <div class="inicio-sesion__foto">
      <img :src="imagenCamarones" alt="" class="inicio-sesion__imagen" />
    </div>
    <div class="inicio-sesion__panel">
      <div class="inicio-sesion__contenido">
        <img :src="logotipo" alt="Global Foods México" class="inicio-sesion__logotipo" />

        <form class="inicio-sesion__formulario" @submit.prevent="iniciarSesion">
          <CampoTextoVue
            id="usuario"
            v-model="usuario"
            etiqueta="Usuario"
            marcador="Usuario"
            icono="usuario"
            autocomplete="username"
            :deshabilitado="cargando"
          />

          <CampoTextoVue
            id="contrasenia"
            v-model="contrasena"
            etiqueta="Contraseña"
            tipo="password"
            icono="candado"
            autocomplete="current-password"
            :deshabilitado="cargando"
          >
            <template #accion>
              <button type="button" class="inicio-sesion__enlace inicio-sesion__enlace--chico">
                ¿Olvidó su contraseña?
              </button>
            </template>
          </CampoTextoVue>

          <p v-if="error" class="inicio-sesion__error" role="alert">
            {{ error }}
          </p>

          <BotonVue
            tipo="submit"
            variante="primario"
            class="inicio-sesion__boton"
            :cargando="cargando"
            :deshabilitado="cargando"
          >
            Ingresar
          </BotonVue>
        </form>

      </div>

      <footer class="inicio-sesion__pie">
        <button type="button" class="inicio-sesion__enlace inicio-sesion__enlace--pie">
          Términos y Condiciones
        </button>
        <span class="inicio-sesion__separador" aria-hidden="true">|</span>
        <button type="button" class="inicio-sesion__enlace inicio-sesion__enlace--pie">
          Política de Privacidad
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.inicio-sesion {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
}

.inicio-sesion__foto {
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.inicio-sesion__imagen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inicio-sesion__panel {
  display: flex;
  flex-direction: column;
  padding: 32px 24px 24px;
  background: var(--gf-superficie);
}

.inicio-sesion__contenido {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.inicio-sesion__logotipo {
  display: block;
  width: 210px;
  max-width: 100%;
  margin: 0 auto 40px;
}

.inicio-sesion__formulario {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.inicio-sesion__error {
  margin: 0;
  font-size: 12px;
  color: var(--gf-cancelado-punto);
}

.inicio-sesion__boton {
  margin-top: 6px;
}

.inicio-sesion__registro {
  margin: 40px 0 0;
  font-size: 13px;
  text-align: center;
}

.inicio-sesion__registro-texto {
  color: var(--gf-secundario);
}

.inicio-sesion__pie {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 24px;
  font-size: 11px;
  color: var(--gf-texto-tenue);
}

.inicio-sesion__separador {
  color: var(--gf-borde);
}

.inicio-sesion__enlace {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--gf-secundario);
  cursor: pointer;
}

.inicio-sesion__enlace:hover {
  text-decoration: underline;
}

.inicio-sesion__enlace:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
  border-radius: 2px;
}

.inicio-sesion__enlace--chico {
  font-size: 12px;
}

.inicio-sesion__enlace--fuerte {
  margin-left: 4px;
  font-weight: 700;
  color: var(--gf-primario);
}

.inicio-sesion__enlace--pie {
  font-size: 11px;
  color: inherit;
}

@media (max-width: 860px) {
  .inicio-sesion {
    grid-template-columns: 1fr;
  }

  .inicio-sesion__foto {
    display: none;
  }
}
</style>
