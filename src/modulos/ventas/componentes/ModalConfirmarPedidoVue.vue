<script setup lang="ts">
// Confirmación del pedido antes de registrarlo y, si sale bien, el folio asignado.
// Cerrar (Escape, velo o X) equivale a "Corregir" al confirmar y a "Registrar otro pedido" al terminar.

import { computed, nextTick, watch } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import ModalVue from '@/componentes/ModalVue.vue'
import {
  MODALIDADES,
  formatearFecha,
  formatearMoneda,
  formatearNumero,
  textoProductosKg,
} from '@/modulos/ventas/controladores/formatosPedido'
import { IDS_CAMPOS } from '@/modulos/ventas/controladores/usarNuevoPedido'
import type { ResumenPedido } from '@/modulos/ventas/interfaces/pedido'

interface Props {
  mostrar: boolean
  estado: 'confirmar' | 'exito'
  resumen: ResumenPedido
  enviando?: boolean
  /** Folio asignado; solo en el estado de éxito. */
  folio?: string
}

const props = withDefaults(defineProps<Props>(), {
  enviando: false,
  folio: '',
})

const emit = defineEmits<{
  (e: 'confirmar'): void
  (e: 'corregir'): void
  (e: 'irInicio'): void
  (e: 'registrarOtro'): void
}>()

const ID_MENSAJE_EXITO = 'pedido-registrado-mensaje'
const ID_REGISTRAR_OTRO = 'pedido-registrar-otro'

const totalTexto = computed(() => formatearMoneda(props.resumen.total))
const modalidad = computed(() => (props.resumen.modalidad ? MODALIDADES[props.resumen.modalidad] : null))

function alCerrar() {
  if (props.estado === 'exito') emit('registrarOtro')
  else emit('corregir')
}

// El botón "Confirmar" desaparece al terminar; el foco pasa a la acción principal del éxito.
watch(
  () => props.estado,
  async (estado) => {
    if (estado !== 'exito') return
    await nextTick()
    document.getElementById(ID_REGISTRAR_OTRO)?.focus()
  },
)
</script>

<template>
  <ModalVue
    :mostrar="mostrar"
    :titulo="estado === 'exito' ? 'Pedido registrado' : 'Confirmar pedido'"
    :cerrable="!enviando"
    :ancho-maximo="520"
    :enfocar-al-cerrar="estado === 'exito' ? IDS_CAMPOS.cliente : undefined"
    @cerrar="alCerrar"
  >
    <div v-if="estado === 'confirmar'" class="confirmacion">
      <dl class="confirmacion__datos">
        <div class="confirmacion__dato">
          <dt><IconoVue nombre="clientes" :tamano="16" /> Cliente</dt>
          <dd>{{ resumen.cliente }}</dd>
        </div>
        <div v-if="modalidad" class="confirmacion__dato">
          <dt><IconoVue :nombre="modalidad.icono" :tamano="16" /> Modalidad</dt>
          <dd>{{ modalidad.titulo }}</dd>
        </div>
        <div class="confirmacion__dato">
          <dt><IconoVue nombre="calendario" :tamano="16" /> Fecha de entrega</dt>
          <dd>{{ formatearFecha(resumen.fechaEntrega) }}</dd>
        </div>
        <template v-if="resumen.modalidad === 'domicilio'">
          <div class="confirmacion__dato confirmacion__dato--largo">
            <dt>Dirección</dt>
            <dd>{{ resumen.direccionEntrega }}</dd>
          </div>
          <div class="confirmacion__dato confirmacion__dato--largo">
            <dt>Referencias</dt>
            <dd>{{ resumen.referencias }}</dd>
          </div>
        </template>
        <div v-if="resumen.observaciones" class="confirmacion__dato confirmacion__dato--largo">
          <dt>Observaciones</dt>
          <dd>{{ resumen.observaciones }}</dd>
        </div>
      </dl>

      <ul class="confirmacion__productos" aria-label="Productos del pedido">
        <li v-for="renglon in resumen.renglones" :key="renglon.productoId" class="confirmacion__renglon">
          <span>
            {{ renglon.nombre }}
            <span class="confirmacion__detalle">
              {{ formatearNumero(renglon.cantidadKg ?? 0) }} kg × {{ formatearMoneda(renglon.precioKg) }}
            </span>
          </span>
          <strong>{{ formatearMoneda(renglon.importe) }}</strong>
        </li>
      </ul>

      <div class="confirmacion__total">
        <span>
          Total
          <span class="confirmacion__detalle">{{ textoProductosKg(resumen.renglones.length, resumen.totalKg) }}</span>
        </span>
        <strong>{{ totalTexto }}</strong>
      </div>

      <p class="confirmacion__pregunta">¿Confirma el registro del pedido por {{ totalTexto }}?</p>
    </div>

    <div v-else class="exito">
      <span class="exito__icono" aria-hidden="true"><IconoVue nombre="check" :tamano="28" /></span>
      <p :id="ID_MENSAJE_EXITO" class="exito__mensaje">
        Pedido <strong>{{ folio }}</strong> registrado correctamente.
      </p>
    </div>

    <template #pie>
      <template v-if="estado === 'confirmar'">
        <BotonVue variante="secundario" :deshabilitado="enviando" @click="emit('corregir')">Corregir</BotonVue>
        <BotonVue variante="exito" :cargando="enviando" data-autofocus @click="emit('confirmar')">
          <IconoVue v-if="!enviando" nombre="check" :tamano="16" />
          {{ enviando ? 'Registrando…' : 'Confirmar' }}
        </BotonVue>
      </template>
      <template v-else>
        <BotonVue variante="secundario" @click="emit('irInicio')">Ir al inicio</BotonVue>
        <BotonVue
          :id="ID_REGISTRAR_OTRO"
          variante="primario"
          :aria-describedby="ID_MENSAJE_EXITO"
          @click="emit('registrarOtro')"
        >
          Registrar otro pedido
        </BotonVue>
      </template>
    </template>
  </ModalVue>
</template>

<style scoped>
.confirmacion :where(p, dl, dd, ul) {
  margin: 0;
}

.confirmacion__datos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirmacion__dato {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
}

.confirmacion__dato dt {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  color: var(--gf-texto-tenue);
}

.confirmacion__dato dd {
  min-width: 0;
  color: var(--gf-texto);
  font-weight: 600;
  text-align: right;
}

.confirmacion__dato--largo dd {
  font-weight: 500;
}

.confirmacion__productos {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  padding: 14px 0 0;
  border-top: 1px solid var(--gf-borde);
  list-style: none;
}

.confirmacion__renglon,
.confirmacion__total {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.confirmacion__detalle {
  display: block;
  color: var(--gf-texto-tenue);
  font-size: 12px;
  font-weight: 400;
}

.confirmacion__total {
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--gf-borde);
  font-weight: 700;
}

.confirmacion__total strong {
  color: var(--gf-primario);
  font-size: 22px;
}

.confirmacion__pregunta {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background: var(--gf-fondo);
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  text-align: center;
}

.exito__icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gf-entregado-bg);
  color: var(--gf-entregado-punto);
}

.exito__mensaje {
  margin: 0;
  color: var(--gf-texto);
  font-size: 16px;
}
</style>
