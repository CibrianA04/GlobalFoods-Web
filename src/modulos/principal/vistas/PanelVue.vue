<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue, { type EstadoPedido } from '@/componentes/ChipEstadoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import { obtenerNombreUsuario } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { obtenerInventarioActual, type ArticuloInventario } from '@/modulos/almacen/servicios/servicioInventario'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const inventario = ref<ArticuloInventario[]>([])
const cargandoInventario = ref(true)
const errorInventario = ref('')

onMounted(async () => {
  try {
    inventario.value = await obtenerInventarioActual()
  } catch (errorCapturado) {
    errorInventario.value = errorCapturado instanceof Error
      ? errorCapturado.message
      : 'No se pudo cargar el inventario.'
  } finally {
    cargandoInventario.value = false
  }
})

const formatoPrecio = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

function mostrarPrecio(precio: number): string {
  return formatoPrecio.format(precio)
}

// agregar `ruta` a cada item cuando existan sus pantallas.
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio' , ruta: '/panel'},
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes', ruta: '/clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario', ruta: '/usuarios' }
]

const columnasInventario: ColumnaTabla[] = [
  { clave: 'talla', etiqueta: 'Talla' },
  { clave: 'precio', etiqueta: 'Precio' },
  { clave: 'master', etiqueta: 'Master', alineacion: 'centro' },
  { clave: 'cantidadKg', etiqueta: 'Stock (kg)', alineacion: 'centro' },
]

const columnasPedidos: ColumnaTabla[] = [
  { clave: 'id', etiqueta: 'ID Pedido' },
  { clave: 'cliente', etiqueta: 'Cliente' },
  { clave: 'estado', etiqueta: 'Estado' },
  { clave: 'total', etiqueta: 'Total', alineacion: 'derecha' },
]

// Datos provisionales, luego reemplazados por los del backend
const pedidos: {
  id: string
  cliente: string
  articulos: number
  estado: EstadoPedido
  total: string
  hace: string
}[] = [
  { id: '#12345', cliente: 'Victoria Ontiveros', articulos: 2, estado: 'pendiente', total: '$560', hace: 'hace 5 min' },
  { id: '#12346', cliente: 'Restaurante Mar y Tierra', articulos: 5, estado: 'en_preparacion', total: '$1,450', hace: 'hace 20 min' },
  { id: '#12347', cliente: 'Mariscos El Faro', articulos: 3, estado: 'en_reparto', total: '$980', hace: 'hace 1 hora' },
]
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    usuario="Administrador"
    :items-navegacion="itemsNavegacion"
    item-activo="Inicio"
  >
    <div class="panel">
      <div class="panel__bienvenida">
        <div>
          <h1 class="panel__titulo">Bienvenido de vuelta, {{ nombreUsuario }}</h1>
          <p class="panel__subtitulo">
            Monitorea el inventario y gestiona los pedidos recientes de hoy.
          </p>
        </div>

        <div class="panel__accion">
          <BotonVue variante="exito" @click="$router.push({ name: 'nuevo-pedido' })">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Pedido
          </BotonVue>
        </div>
      </div>

      <section>
        <EncabezadoSeccionVue titulo="Inventario" icono="caja" />

        <TablaVue :columnas="columnasInventario" :alto-maximo="180">
          <tr v-if="cargandoInventario">
            <td colspan="4">Cargando inventario...</td>
          </tr>
          <tr v-else-if="errorInventario">
            <td colspan="4" role="alert">{{ errorInventario }}</td>
          </tr>
          <tr v-else-if="inventario.length === 0">
            <td colspan="4">No hay productos disponibles.</td>
          </tr>
          <tr v-for="fila in inventario" :key="fila.talla">
            <td>{{ fila.talla }}</td>
            <td>{{ mostrarPrecio(fila.precio) }}</td>
            <td class="tabla__celda--centro">{{ fila.master }}</td>
            <td class="tabla__celda--centro">{{ fila.cantidadKg }}</td>
          </tr>
        </TablaVue>
      </section>

      <section class="panel__pedidos">
        <EncabezadoSeccionVue titulo="Pedidos Actuales" icono="reloj" />

        <TablaVue :columnas="columnasPedidos" :alto-maximo="170">
          <tr v-for="pedido in pedidos" :key="pedido.id">
            <td class="panel__id">{{ pedido.id }}</td>
            <td>
              <p class="panel__cliente">{{ pedido.cliente }}</p>
              <p class="panel__detalle">{{ pedido.articulos }} Items</p>
            </td>
            <td>
              <ChipEstadoVue :estado="pedido.estado" />
            </td>
            <td class="tabla__celda--derecha">
              <p class="panel__total">{{ pedido.total }}</p>
              <p class="panel__detalle panel__hace">
                <IconoVue nombre="reloj" :tamano="12" />
                {{ pedido.hace }}
              </p>
            </td>
          </tr>
        </TablaVue>
      </section>
    </div>
  </LayoutPanelVue>
</template>

<style scoped>
.panel__bienvenida {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel__pedidos {
  margin-top: 20px;
}

.panel__titulo {
  margin: 0;
  color: var(--gf-texto);
  font-size: 24px;
  font-weight: 700;
}

.panel__subtitulo {
  margin: 6px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 14px;
}

/* BotonVue ocupa todo el ancho de su contenedor; este se ajusta al texto. */
.panel__accion {
  flex: none;
}

.panel__id {
  font-weight: 700;
}

.panel__cliente {
  margin: 0;
  font-weight: 500;
}

.panel__detalle {
  margin: 2px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.panel__total {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.panel__hace {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

@media (max-width: 900px) {
  .panel__titulo {
    font-size: 20px;
  }
}

@media (max-width: 560px) {
  .panel__bienvenida {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
