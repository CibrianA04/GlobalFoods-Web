<script setup lang="ts">
import BotonVue from '@/componentes/BotonVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'

interface Props {
  mostrar: boolean
  titulo?: string
  mensaje?: string
  textoBotonConfirmar?: string
}

withDefaults(defineProps<Props>(), {
  titulo: '¿Eliminar registro?',
  mensaje: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?',
  textoBotonConfirmar: 'Eliminar',
})

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="mostrar" class="overlay" @click.self="emit('cerrar')">
      <div class="modal">
        <div class="modal__icono-wrap">
          <IconoVue nombre="basura" :tamano="24" />
        </div>

        <h3 class="modal__titulo">{{ titulo }}</h3>
        <p class="modal__mensaje">{{ mensaje }}</p>

        <div class="modal__acciones">
          <BotonVue variante="secundario" @click="emit('cerrar')">
            Cancelar
          </BotonVue>
          <BotonVue variante="peligro" @click="emit('confirmar')">
            {{ textoBotonConfirmar }}
          </BotonVue>
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
  text-align: center;
  width: 100%;
  max-width: 380px;
  padding: 28px 24px;
  border-radius: 16px;
  background: var(--gf-superficie);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--gf-borde);
}

.modal__icono-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gf-cancelado-bg);
  color: var(--gf-cancelado-fg);
  margin-bottom: 16px;
}

.modal__titulo {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--gf-texto);
}

.modal__mensaje {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--gf-texto-tenue);
  line-height: 1.4;
}

.modal__acciones {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

.modal__acciones > * {
  flex: 1;
}
</style>