<script setup lang="ts">
// Paso 3 del pedido: modalidad, fecha y, si es a domicilio, dirección y referencias.

import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import { MODALIDADES, fechaHoyIso } from '@/modulos/ventas/controladores/formatosPedido'
import { IDS_CAMPOS, MAXIMO_OBSERVACIONES } from '@/modulos/ventas/controladores/usarNuevoPedido'
import type { ModalidadEntrega } from '@/modulos/ventas/interfaces/pedido'

interface Props {
  /** Dirección registrada del cliente elegido; habilita la casilla "Usar la dirección registrada". */
  direccionCliente: string | null
  errores: {
    modalidad: string
    fecha: string
    direccion: string
    referencias: string
  }
}

defineProps<Props>()

const modalidad = defineModel<ModalidadEntrega | null>('modalidad', { required: true })
const fechaEntrega = defineModel<string>('fechaEntrega', { required: true })
const usarDireccionRegistrada = defineModel<boolean>('usarDireccionRegistrada', { required: true })
const direccionEntrega = defineModel<string>('direccionEntrega', { required: true })
const referencias = defineModel<string>('referencias', { required: true })
const observaciones = defineModel<string>('observaciones', { required: true })

const opciones = (Object.keys(MODALIDADES) as ModalidadEntrega[]).map((valor) => ({ valor, ...MODALIDADES[valor] }))

const ID_LEYENDA = 'pedido-modalidad-leyenda'
const ID_CONTADOR = `${IDS_CAMPOS.observaciones}-contador`
const hoy = fechaHoyIso()
</script>

<template>
  <section class="entrega">
    <EncabezadoSeccionVue :paso="3" titulo="Entrega" icono="camion" />

    <fieldset
      class="modalidad"
      role="radiogroup"
      :aria-labelledby="ID_LEYENDA"
      aria-required="true"
      :aria-invalid="errores.modalidad ? true : undefined"
      :aria-describedby="errores.modalidad ? IDS_CAMPOS.errorModalidad : undefined"
    >
      <legend :id="ID_LEYENDA" class="entrega__etiqueta">
        Modalidad<span class="entrega__obligatorio" aria-hidden="true"> *</span>
      </legend>

      <div class="modalidad__opciones">
        <label
          v-for="opcion in opciones"
          :key="opcion.valor"
          class="modalidad__opcion"
          :class="{
            'modalidad__opcion--activa': modalidad === opcion.valor,
            'modalidad__opcion--con-error': !!errores.modalidad,
          }"
        >
          <input
            :id="`pedido-modalidad-${opcion.valor}`"
            v-model="modalidad"
            class="modalidad__radio"
            type="radio"
            name="pedido-modalidad"
            :value="opcion.valor"
            :aria-labelledby="`pedido-modalidad-${opcion.valor}-titulo`"
            :aria-describedby="`pedido-modalidad-${opcion.valor}-descripcion`"
          />
          <span class="modalidad__icono">
            <IconoVue :nombre="opcion.icono" :tamano="18" />
          </span>
          <span class="modalidad__textos">
            <span :id="`pedido-modalidad-${opcion.valor}-titulo`" class="modalidad__titulo">{{ opcion.titulo }}</span>
            <span :id="`pedido-modalidad-${opcion.valor}-descripcion`" class="modalidad__descripcion">
              {{ opcion.descripcion }}
            </span>
          </span>
        </label>
      </div>

      <p v-if="errores.modalidad" :id="IDS_CAMPOS.errorModalidad" class="entrega__error">
        {{ errores.modalidad }}
      </p>
    </fieldset>

    <div class="entrega__fila">
      <CampoTextoVue
        :id="IDS_CAMPOS.fecha"
        v-model="fechaEntrega"
        etiqueta="Fecha requerida de entrega"
        tipo="date"
        obligatorio
        compacto
        :min="hoy"
        :error="errores.fecha"
      />

      <CampoTextoVue
        v-if="modalidad === 'domicilio'"
        :id="IDS_CAMPOS.direccion"
        v-model="direccionEntrega"
        etiqueta="Dirección de entrega"
        marcador="Calle, número, colonia y ciudad"
        obligatorio
        compacto
        autocomplete="off"
        :readonly="usarDireccionRegistrada"
        :error="errores.direccion"
      />
    </div>

    <template v-if="modalidad === 'domicilio'">
      <label class="entrega__casilla" :class="{ 'entrega__casilla--deshabilitada': !direccionCliente }">
        <input
          v-model="usarDireccionRegistrada"
          type="checkbox"
          :disabled="!direccionCliente"
          :aria-controls="IDS_CAMPOS.direccion"
        />
        Usar la dirección registrada del cliente
      </label>

      <!-- CampoTextoVue pasa class al <input>; el margen va en un contenedor. -->
      <div class="entrega__campo">
        <CampoTextoVue
          :id="IDS_CAMPOS.referencias"
          v-model="referencias"
          etiqueta="Referencias"
          marcador="Entre calles, fachada o cómo identificar el lugar"
          obligatorio
          compacto
          autocomplete="off"
          :error="errores.referencias"
        />
      </div>
    </template>

    <div class="entrega__campo observaciones">
      <label class="entrega__etiqueta" :for="IDS_CAMPOS.observaciones">
        Observaciones <span class="observaciones__opcional">(opcional)</span>
      </label>
      <textarea
        :id="IDS_CAMPOS.observaciones"
        v-model="observaciones"
        class="observaciones__texto"
        rows="3"
        :maxlength="MAXIMO_OBSERVACIONES"
        placeholder="Indicaciones para almacén o reparto (máximo 250 caracteres)"
        :aria-describedby="ID_CONTADOR"
      ></textarea>
      <p
        :id="ID_CONTADOR"
        class="observaciones__contador"
        :class="{ 'observaciones__contador--limite': observaciones.length >= MAXIMO_OBSERVACIONES }"
      >
        {{ observaciones.length }}/{{ MAXIMO_OBSERVACIONES }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.entrega__etiqueta {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 500;
}

.entrega__obligatorio {
  color: var(--gf-cancelado-punto);
}

.entrega__error {
  margin: 6px 0 0;
  color: var(--gf-cancelado-punto);
  font-size: 13px;
}

.modalidad {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.modalidad legend {
  margin-bottom: 6px;
  padding: 0;
}

.modalidad__opciones {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.modalidad__opcion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--gf-borde);
  border-radius: 10px;
  background: var(--gf-superficie);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.modalidad__opcion:hover {
  border-color: var(--gf-claro);
}

.modalidad__opcion--activa,
.modalidad__opcion--activa:hover {
  border-color: var(--gf-secundario);
  background: color-mix(in srgb, var(--gf-claro) 12%, var(--gf-superficie));
  box-shadow: 0 0 0 1px var(--gf-secundario);
}

.modalidad__opcion--con-error {
  border-color: var(--gf-cancelado-punto);
}

.modalidad__opcion:has(.modalidad__radio:focus-visible) {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.modalidad__radio {
  flex: none;
  width: 16px;
  height: 16px;
  margin: 10px 0 0;
  accent-color: var(--gf-secundario);
}

.modalidad__icono {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--gf-fondo);
  color: var(--gf-secundario);
}

.modalidad__textos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modalidad__titulo {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 700;
}

.modalidad__descripcion {
  color: var(--gf-texto-tenue);
  font-size: 12px;
  line-height: 1.35;
}

.entrega__fila {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 16px;
  margin-top: 18px;
}

.entrega__casilla {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: var(--gf-texto);
  font-size: 13px;
  cursor: pointer;
}

.entrega__casilla input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--gf-secundario);
}

.entrega__casilla--deshabilitada {
  color: var(--gf-texto-tenue);
  cursor: not-allowed;
}

.entrega__campo {
  margin-top: 16px;
}

.observaciones {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.observaciones__opcional {
  color: var(--gf-texto-tenue);
  font-weight: 400;
}

.observaciones__texto {
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  border: 1px solid var(--gf-borde);
  border-radius: 8px;
  background: var(--gf-campo-fondo);
  color: var(--gf-texto);
  font: inherit;
  font-size: 15px;
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.observaciones__texto::placeholder {
  color: var(--gf-texto-tenue);
  opacity: 0.8;
}

.observaciones__texto:focus {
  border-color: var(--gf-secundario);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-secundario) 22%, transparent);
}

.observaciones__contador {
  margin: 0;
  color: var(--gf-texto-tenue);
  font-size: 12px;
  text-align: right;
}

.observaciones__contador--limite {
  color: var(--gf-preparacion-fg);
  font-weight: 700;
}

@media (max-width: 640px) {
  .modalidad__opciones,
  .entrega__fila {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
