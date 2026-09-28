<script setup lang="ts">
// Barra superior del panel: logo, título de la pantalla y usuario.

import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BotonVue from '@/componentes/BotonVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import { cerrarSesion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import logo from '@/recursos/logo-transparente.png'

interface Props {
  titulo: string
  /** Nombre del usuario; */
  usuario: string
}

const props = defineProps<Props>()
const enrutador = useRouter()

function salir(): void {
  cerrarSesion()
  enrutador.replace('/inicio-sesion')
}

// Iniciales de las dos primeras palabras del nombre.
const iniciales = computed(() =>
  props.usuario
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <header class="encabezado">
    <div class="encabezado__marca">
      <img :src="logo" alt="Global Foods México" class="encabezado__logo" />
    </div>

    <span class="encabezado__separador" aria-hidden="true"></span>

    <p class="encabezado__titulo">{{ titulo }}</p>

    <div class="encabezado__usuario">
      <span class="encabezado__avatar" aria-hidden="true">{{ iniciales }}</span>
      <p class="encabezado__nombre">{{ usuario }}</p>

      <BotonVue
        variante="secundario"
        solo-icono
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        @click="salir"
      >
        <IconoVue nombre="salir" :tamano="18" />
      </BotonVue>
    </div>
  </header>
</template>

<style scoped>
.encabezado {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 60px;
  padding: 0 28px;
  background: var(--gf-primario);
  color: var(--gf-superficie);
}

.encabezado__marca {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 3px;
  border-radius: 6px;
  background: var(--gf-superficie);
}

.encabezado__logo {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.encabezado__separador {
  flex: none;
  width: 1px;
  height: 28px;
  background: color-mix(in srgb, var(--gf-superficie) 18%, transparent);
}

.encabezado__titulo {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encabezado__usuario {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
}

.encabezado__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gf-secundario);
  font-size: 13px;
  font-weight: 700;
}

.encabezado__nombre {
  margin: 0 8px 0 0;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .encabezado {
    gap: 12px;
    height: 56px;
    padding: 0 16px;
  }

  .encabezado__separador,
  .encabezado__nombre {
    display: none;
  }

  .encabezado__titulo {
    font-size: 16px;
  }
}
</style>
