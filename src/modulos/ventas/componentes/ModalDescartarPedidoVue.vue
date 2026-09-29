<script setup lang="ts">
// Confirma que se quieren descartar los datos capturados antes de salir de Nuevo pedido.
// El foco inicial va a "Seguir capturando", la opción que no pierde nada.

import BotonVue from '@/componentes/BotonVue.vue'
import ModalVue from '@/componentes/ModalVue.vue'

interface Props {
  mostrar: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'seguir'): void
  (e: 'descartar'): void
}>()
</script>

<template>
  <ModalVue :mostrar="mostrar" titulo="¿Descartar el pedido?" :ancho-maximo="440" @cerrar="emit('seguir')">
    <p class="descartar__texto">
      Si sale de esta pantalla se perderán el cliente, los productos y los datos de entrega que capturó.
    </p>

    <template #pie>
      <BotonVue variante="secundario" data-autofocus @click="emit('seguir')">Seguir capturando</BotonVue>
      <BotonVue variante="primario" @click="emit('descartar')">Descartar pedido</BotonVue>
    </template>
  </ModalVue>
</template>

<style scoped>
.descartar__texto {
  margin: 0;
  color: var(--gf-texto);
  font-size: 14px;
  line-height: 1.5;
}
</style>
