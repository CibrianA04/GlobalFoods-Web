<script setup lang="ts">
// Columna derecha de Nuevo pedido: resumen en vivo, total y acciones.

import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import {
  MODALIDADES,
  formatearFecha,
  formatearMoneda,
  formatearNumero,
  textoProductosKg,
} from '@/modulos/ventas/controladores/formatosPedido'
import type { ResumenPedido } from '@/modulos/ventas/interfaces/pedido'

interface Props {
  resumen: ResumenPedido
  enviando?: boolean
}

withDefaults(defineProps<Props>(), {
  enviando: false,
})

const emit = defineEmits<{
  (e: 'registrar'): void
  (e: 'cancelar'): void
}>()

const SIN_DATO = '—'
</script>

<template>
  <aside class="resumen" aria-label="Resumen del pedido">
    <EncabezadoSeccionVue titulo="Resumen del pedido" icono="pedidos" />

    <dl class="resumen__datos">
      <div class="resumen__dato">
        <dt>Estado inicial</dt>
        <dd><ChipEstadoVue estado="pendiente" /></dd>
      </div>
      <div class="resumen__dato">
        <dt>Folio</dt>
        <dd>Se asigna al registrar</dd>
      </div>
    </dl>

    <dl class="resumen__datos resumen__bloque">
      <div class="resumen__dato">
        <dt>Cliente</dt>
        <dd>{{ resumen.cliente ?? SIN_DATO }}</dd>
      </div>
      <div class="resumen__dato">
        <dt>Modalidad</dt>
        <dd>{{ resumen.modalidad ? MODALIDADES[resumen.modalidad].titulo : SIN_DATO }}</dd>
      </div>
      <div class="resumen__dato">
        <dt>Fecha de entrega</dt>
        <dd>{{ formatearFecha(resumen.fechaEntrega) || SIN_DATO }}</dd>
      </div>
    </dl>

    <div class="resumen__bloque resumen__productos">
      <ul v-if="resumen.renglones.length" class="resumen__lista" aria-label="Productos del pedido">
        <li v-for="renglon in resumen.renglones" :key="renglon.productoId" class="resumen__renglon">
          <div>
            <p class="resumen__producto">{{ renglon.nombre }}</p>
            <p class="resumen__detalle">
              {{ renglon.cantidadKg === null ? SIN_DATO : formatearNumero(renglon.cantidadKg) }} kg ×
              {{ formatearMoneda(renglon.precioKg) }}
            </p>
          </div>
          <p class="resumen__importe">{{ formatearMoneda(renglon.importe) }}</p>
        </li>
      </ul>
      <p v-else class="resumen__vacio">Todavía no hay productos.</p>
    </div>

    <div class="resumen__bloque resumen__total">
      <div>
        <p class="resumen__total-etiqueta">Total</p>
        <p class="resumen__detalle">{{ textoProductosKg(resumen.renglones.length, resumen.totalKg) }}</p>
      </div>
      <p class="resumen__total-importe">{{ formatearMoneda(resumen.total) }}</p>
    </div>

    <div class="resumen__acciones">
      <BotonVue variante="exito" :deshabilitado="enviando" @click="emit('registrar')">
        <IconoVue nombre="check" :tamano="16" />
        Registrar pedido
      </BotonVue>
      <BotonVue variante="secundario" :deshabilitado="enviando" @click="emit('cancelar')">Cancelar</BotonVue>
    </div>

    <p class="resumen__nota">Antes de registrar se mostrará el resumen para confirmar el pedido.</p>
  </aside>
</template>

<style scoped>
.resumen {
  display: flex;
  flex-direction: column;
}

/* :where() no suma especificidad; así los márgenes de abajo sí aplican. */
.resumen :where(p, dl, dd) {
  margin: 0;
}

.resumen__bloque {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--gf-borde);
}

.resumen__datos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resumen__dato {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.resumen__dato dt {
  flex: none;
  color: var(--gf-texto-tenue);
}

.resumen__dato dd {
  min-width: 0;
  color: var(--gf-texto);
  font-weight: 600;
  text-align: right;
}

/* Si hay muchos productos, la lista se desplaza y los botones siguen a la vista. */
.resumen__productos {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.resumen__lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.resumen__renglon {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.resumen__producto {
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 500;
}

.resumen__detalle {
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.resumen__importe {
  flex: none;
  color: var(--gf-texto);
  font-size: 14px;
  font-weight: 700;
}

.resumen__vacio {
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.resumen__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.resumen__total-etiqueta {
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 700;
}

.resumen__total-importe {
  color: var(--gf-primario);
  font-size: 26px;
  font-weight: 800;
}

.resumen__acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.resumen__nota {
  margin-top: 12px;
  color: var(--gf-texto-tenue);
  font-size: 12px;
  text-align: center;
}
</style>
