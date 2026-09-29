<script setup lang="ts">
// Paso 2 del pedido: productos con su cantidad en kg.
// Los botones − / + usan aria-disabled en lugar de disabled para no perder el foco al llegar al límite.

import { computed, nextTick, ref } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import {
  formatearKg,
  formatearMoneda,
  textoProductosKg,
} from '@/modulos/ventas/controladores/formatosPedido'
import {
  IDS_CAMPOS,
  MENSAJES,
  idCampoCantidad,
  leerCantidad,
  limpiarCantidad,
  puedeAumentar,
  puedeDisminuir,
} from '@/modulos/ventas/controladores/usarNuevoPedido'
import type { RenglonPedido, ResumenPedido } from '@/modulos/ventas/interfaces/pedido'

interface Props {
  renglones: RenglonPedido[]
  resumen: ResumenPedido
  /** Error de cantidad por productoId. */
  erroresCantidad: Record<string, string>
  /** Error general de la lista (sin productos). */
  error?: string
  cargandoInventario?: boolean
  errorInventario?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
  cargandoInventario: false,
  errorInventario: false,
})

const emit = defineEmits<{
  (e: 'agregar'): void
  (e: 'quitar', productoId: string): void
  (e: 'cambiarCantidad', productoId: string, texto: string): void
  (e: 'aumentar', productoId: string): void
  (e: 'disminuir', productoId: string): void
}>()

const columnas: ColumnaTabla[] = [
  { clave: 'producto', etiqueta: 'Producto' },
  { clave: 'precio', etiqueta: 'Precio' },
  { clave: 'disponible', etiqueta: 'Disponible' },
  { clave: 'cantidad', etiqueta: 'Cantidad' },
  { clave: 'subtotal', etiqueta: 'Subtotal', alineacion: 'derecha' },
  { clave: 'acciones', etiqueta: 'Acciones', ocultarEtiqueta: true },
]

const importePorProducto = computed(
  () => new Map(props.resumen.renglones.map((renglon) => [renglon.productoId, renglon.importe])),
)

const agregarDeshabilitado = computed(() => props.cargandoInventario || props.errorInventario)

/** Texto para lectores de pantalla al quitar un producto. */
const anuncio = ref('')

const idQuitar = (productoId: string) => `${idCampoCantidad(productoId)}-quitar`

function excede(renglon: RenglonPedido): boolean {
  const cantidad = leerCantidad(renglon.cantidadCapturada)
  return cantidad !== null && cantidad > renglon.producto.disponibleKg
}

function alCapturar(productoId: string, evento: Event) {
  const campo = evento.target as HTMLInputElement
  const limpio = limpiarCantidad(campo.value)
  // Si el texto cambió al limpiarlo, el modelo puede quedar igual y Vue no repinta el campo.
  if (campo.value !== limpio) campo.value = limpio
  emit('cambiarCantidad', productoId, limpio)
}

function aumentar(renglon: RenglonPedido) {
  if (puedeAumentar(renglon)) emit('aumentar', renglon.producto.productoId)
}

function disminuir(renglon: RenglonPedido) {
  if (puedeDisminuir(renglon)) emit('disminuir', renglon.producto.productoId)
}

// Al quitar un renglón, el foco pasa al botón de quitar del renglón que ocupa su lugar
// (o al anterior); si ya no hay renglones, a "Agregar producto".
async function quitar(indice: number, renglon: RenglonPedido) {
  emit('quitar', renglon.producto.productoId)
  anuncio.value = `Se quitó ${renglon.producto.nombre} del pedido.`
  await nextTick()
  const vecino = props.renglones[indice] ?? props.renglones[indice - 1]
  document.getElementById(vecino ? idQuitar(vecino.producto.productoId) : IDS_CAMPOS.agregarProducto)?.focus()
}
</script>

<template>
  <section class="productos">
    <EncabezadoSeccionVue :paso="2" titulo="Productos" icono="caja">
      <BotonVue
        :id="IDS_CAMPOS.agregarProducto"
        variante="secundario"
        compacto
        :deshabilitado="agregarDeshabilitado"
        :aria-describedby="error ? IDS_CAMPOS.errorProductos : undefined"
        @click="emit('agregar')"
      >
        <IconoVue nombre="mas" :tamano="16" />
        Agregar producto
      </BotonVue>
    </EncabezadoSeccionVue>

    <p v-if="errorInventario" class="productos__alerta" role="alert">
      <IconoVue nombre="alerta" :tamano="18" />
      {{ MENSAJES.inventarioNoDisponible }}
    </p>

    <TablaVue :columnas="columnas">
      <tr v-if="renglones.length === 0">
        <td colspan="6" class="productos__vacio">
          <IconoVue nombre="caja" :tamano="28" class="productos__vacio-icono" />
          <p class="productos__vacio-titulo">
            {{ cargandoInventario ? 'Cargando inventario…' : 'Aún no hay productos en el pedido' }}
          </p>
          <p v-if="!cargandoInventario && !errorInventario" class="productos__vacio-texto">
            Use «Agregar producto» para elegirlos del inventario disponible.
          </p>
        </td>
      </tr>

      <template v-for="(renglon, indice) in renglones" :key="renglon.producto.productoId">
        <tr
          class="productos__renglon"
          :class="{
            'productos__renglon--excedido': excede(renglon),
            'productos__renglon--con-mensaje': !!erroresCantidad[renglon.producto.productoId],
          }"
        >
          <td>
            <p class="productos__nombre">{{ renglon.producto.nombre }}</p>
            <p class="productos__secundario">{{ renglon.producto.presentacion }}</p>
          </td>
          <td>
            <p class="productos__precio">{{ formatearMoneda(renglon.producto.precioKg) }}</p>
            <p class="productos__secundario">por kg</p>
          </td>
          <td>{{ formatearKg(renglon.producto.disponibleKg) }}</td>
          <td>
            <div class="cantidad">
              <button
                type="button"
                class="cantidad__boton"
                :aria-label="`Disminuir cantidad de ${renglon.producto.nombre}`"
                :aria-disabled="!puedeDisminuir(renglon)"
                @click="disminuir(renglon)"
              >
                <IconoVue nombre="menos" :tamano="14" />
              </button>
              <input
                :id="idCampoCantidad(renglon.producto.productoId)"
                class="cantidad__entrada"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                :value="renglon.cantidadCapturada"
                :aria-label="`Cantidad en kg de ${renglon.producto.nombre}`"
                :aria-invalid="erroresCantidad[renglon.producto.productoId] ? true : undefined"
                :aria-describedby="
                  erroresCantidad[renglon.producto.productoId]
                    ? `${idCampoCantidad(renglon.producto.productoId)}-error`
                    : undefined
                "
                @input="alCapturar(renglon.producto.productoId, $event)"
              />
              <button
                type="button"
                class="cantidad__boton"
                :aria-label="`Aumentar cantidad de ${renglon.producto.nombre}`"
                :aria-disabled="!puedeAumentar(renglon)"
                @click="aumentar(renglon)"
              >
                <IconoVue nombre="mas" :tamano="14" />
              </button>
              <span class="cantidad__unidad" aria-hidden="true">kg</span>
            </div>
          </td>
          <td class="tabla__celda--derecha productos__subtotal">
            {{ formatearMoneda(importePorProducto.get(renglon.producto.productoId) ?? 0) }}
          </td>
          <td class="tabla__celda--centro">
            <button
              :id="idQuitar(renglon.producto.productoId)"
              type="button"
              class="productos__quitar"
              :aria-label="`Quitar ${renglon.producto.nombre}`"
              @click="quitar(indice, renglon)"
            >
              <IconoVue nombre="basura" :tamano="16" />
            </button>
          </td>
        </tr>

        <tr
          v-if="erroresCantidad[renglon.producto.productoId]"
          class="productos__mensaje"
          :class="{ 'productos__renglon--excedido': excede(renglon) }"
        >
          <td colspan="6">
            <p
              :id="`${idCampoCantidad(renglon.producto.productoId)}-error`"
              class="productos__error"
              :role="excede(renglon) ? 'alert' : undefined"
            >
              {{ erroresCantidad[renglon.producto.productoId] }}
            </p>
          </td>
        </tr>
      </template>
    </TablaVue>

    <p v-if="error" :id="IDS_CAMPOS.errorProductos" class="productos__error productos__error--general" tabindex="-1">
      {{ error }}
    </p>

    <div class="productos__pie">
      <span>{{ textoProductosKg(renglones.length, resumen.totalKg) }}</span>
      <span class="productos__importe">
        Importe de productos
        <strong>{{ formatearMoneda(resumen.total) }}</strong>
      </span>
    </div>

    <p class="visualmente-oculto" role="status">{{ anuncio }}</p>
  </section>
</template>

<style scoped>
.productos p {
  margin: 0;
}

.productos .productos__alerta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--gf-preparacion-punto) 45%, transparent);
  border-radius: 8px;
  background: var(--gf-preparacion-bg);
  color: var(--gf-preparacion-fg);
  font-size: 14px;
  font-weight: 500;
}

.productos__nombre {
  font-weight: 600;
}

.productos__precio {
  font-weight: 500;
}

.productos__secundario {
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.productos__subtotal {
  font-weight: 700;
}

/* Tres clases para ganarle a los estilos de celda de TablaVue. */
.productos .productos__renglon--con-mensaje > td {
  border-bottom: 0;
}

.productos .productos__renglon--excedido > td {
  background: var(--gf-cancelado-bg);
}

.productos .productos__mensaje > td {
  padding-top: 0;
  white-space: normal;
}

.productos .productos__vacio {
  padding: 28px 16px;
  text-align: center;
  white-space: normal;
}

.productos__vacio-icono {
  margin: 0 auto 8px;
  color: var(--gf-texto-tenue);
}

.productos__vacio-titulo {
  font-weight: 600;
}

.productos .productos__vacio-texto {
  margin-top: 4px;
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.productos__error {
  color: var(--gf-cancelado-punto);
  font-size: 13px;
}

.productos .productos__error--general {
  margin-top: 8px;
}

.productos__error--general:focus {
  outline: none;
}

.cantidad {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cantidad__boton {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--gf-borde);
  border-radius: 6px;
  background: var(--gf-superficie);
  color: var(--gf-texto);
  cursor: pointer;
}

.cantidad__boton:hover:not([aria-disabled='true']) {
  background: var(--gf-fondo);
}

.cantidad__boton[aria-disabled='true'] {
  opacity: 0.4;
  cursor: not-allowed;
}

.cantidad__boton:focus-visible,
.productos__quitar:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 1px;
}

.cantidad__entrada {
  width: 52px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid var(--gf-borde);
  border-radius: 6px;
  background: var(--gf-campo-fondo);
  color: var(--gf-texto);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.cantidad__entrada:focus {
  border-color: var(--gf-secundario);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-secundario) 22%, transparent);
}

.cantidad__entrada[aria-invalid='true'] {
  border-color: var(--gf-cancelado-punto);
}

.cantidad__unidad {
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.productos__quitar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--gf-texto-tenue);
  cursor: pointer;
}

.productos__quitar:hover {
  background: var(--gf-cancelado-bg);
  color: var(--gf-cancelado-fg);
}

.productos__pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-top: 12px;
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.productos__importe {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.productos__importe strong {
  color: var(--gf-texto);
  font-size: 16px;
}
</style>
