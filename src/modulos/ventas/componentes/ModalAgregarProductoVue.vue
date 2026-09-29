<script setup lang="ts">
// Lista del inventario para agregar productos al pedido. Se queda abierto para agregar varios.

import { computed, nextTick, ref, watch } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import CampoTextoVue from '@/componentes/CampoTextoVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import ModalVue from '@/componentes/ModalVue.vue'
import { formatearKg, formatearMoneda } from '@/modulos/ventas/controladores/formatosPedido'
import type { ProductoVenta } from '@/modulos/ventas/interfaces/pedido'

interface Props {
  mostrar: boolean
  productos: ProductoVenta[]
  /** productoId de los productos que ya están en el pedido. */
  agregados: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'agregar', producto: ProductoVenta): void
}>()

const ID_BUSQUEDA = 'pedido-buscar-producto'
const busqueda = ref('')
const anuncio = ref('')

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const filtrados = computed(() => {
  const texto = normalizar(busqueda.value)
  if (!texto) return props.productos
  return props.productos.filter(
    (producto) => normalizar(producto.nombre).includes(texto) || normalizar(producto.productoId).includes(texto),
  )
})

// Cada vez que se abre, empieza sin filtro.
watch(
  () => props.mostrar,
  (visible) => {
    if (visible) {
      busqueda.value = ''
      anuncio.value = ''
    }
  },
)

const estaAgregado = (producto: ProductoVenta) => props.agregados.includes(producto.productoId)
const estaAgotado = (producto: ProductoVenta) => producto.disponibleKg <= 0

// El botón queda deshabilitado al agregar; el foco regresa al buscador para seguir eligiendo.
async function agregar(producto: ProductoVenta) {
  emit('agregar', producto)
  anuncio.value = `Se agregó ${producto.nombre} al pedido con 1 kg.`
  await nextTick()
  document.getElementById(ID_BUSQUEDA)?.focus()
}
</script>

<template>
  <ModalVue :mostrar="mostrar" titulo="Agregar producto" :ancho-maximo="600" @cerrar="emit('cerrar')">
    <CampoTextoVue
      :id="ID_BUSQUEDA"
      v-model="busqueda"
      etiqueta="Buscar producto"
      marcador="Talla o nombre, por ejemplo 16/20"
      icono="lupa"
      compacto
      autocomplete="off"
      data-autofocus
    />

    <ul v-if="filtrados.length" class="productos-modal" aria-label="Productos del inventario">
      <li v-for="producto in filtrados" :key="producto.productoId" class="productos-modal__item">
        <div class="productos-modal__datos">
          <p class="productos-modal__nombre">{{ producto.nombre }}</p>
          <p class="productos-modal__detalle">{{ producto.presentacion }}</p>
          <p class="productos-modal__detalle">
            <strong>{{ formatearMoneda(producto.precioKg) }}</strong> por kg ·
            {{ formatearKg(producto.disponibleKg) }} disponibles
          </p>
        </div>

        <ChipEstadoVue
          :estado="estaAgotado(producto) ? 'cancelado' : 'entregado'"
          :etiqueta="estaAgotado(producto) ? 'Agotado' : 'Disponible'"
        />

        <div class="productos-modal__accion">
          <BotonVue
            :variante="estaAgregado(producto) ? 'secundario' : 'primario'"
            compacto
            :deshabilitado="estaAgotado(producto) || estaAgregado(producto)"
            :aria-label="estaAgregado(producto) ? `${producto.nombre} agregado` : `Agregar ${producto.nombre}`"
            @click="agregar(producto)"
          >
            {{ estaAgregado(producto) ? 'Agregado' : 'Agregar' }}
          </BotonVue>
        </div>
      </li>
    </ul>

    <p v-else class="productos-modal__vacio">
      {{ productos.length ? 'No se encontraron productos con ese criterio.' : 'No hay productos en el inventario.' }}
    </p>

    <p class="visualmente-oculto" role="status">{{ anuncio }}</p>

    <template #pie>
      <BotonVue variante="secundario" @click="emit('cerrar')">Listo</BotonVue>
    </template>
  </ModalVue>
</template>

<style scoped>
.productos-modal {
  display: flex;
  flex-direction: column;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.productos-modal__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--gf-borde);
}

.productos-modal__item:first-child {
  border-top: 0;
}

.productos-modal__datos {
  flex: 1;
  min-width: 0;
}

.productos-modal__datos :where(p) {
  margin: 0;
}

.productos-modal__nombre {
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 700;
}

.productos-modal__detalle {
  margin-top: 2px;
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.productos-modal__detalle strong {
  color: var(--gf-texto);
}

.productos-modal__accion {
  flex: none;
  width: 104px;
}

.productos-modal__vacio {
  margin: 16px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 560px) {
  .productos-modal__item {
    flex-wrap: wrap;
  }

  .productos-modal__accion {
    width: 100%;
  }
}
</style>
