<script setup lang="ts">
import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue, { type EstadoPedido } from '@/componentes/ChipEstadoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'

// agregar `ruta` a cada item cuando existan sus pantallas.
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario' },
]

const columnasInventario: ColumnaTabla[] = [
  { clave: 'talla', etiqueta: 'Talla' },
  { clave: 'precio', etiqueta: 'Precio' },
  { clave: 'master', etiqueta: 'Master', alineacion: 'centro' },
  { clave: 'stock', etiqueta: 'Stock', alineacion: 'centro' },
]

// Datos provisionales, luego reemplazados por los del backend
const inventario = [
  { talla: '16/20', precio: '$340', master: 20, stock: 30 },
  { talla: '21/25', precio: '$310', master: 20, stock: 45 },
  { talla: '26/30', precio: '$295', master: 20, stock: 38 },
  { talla: '31/35', precio: '$280', master: 20, stock: 52 },
  { talla: '36/40', precio: '$270', master: 20, stock: 60 },
  { talla: '41/50', precio: '$250', master: 20, stock: 45 },
  { talla: '51/60', precio: '$230', master: 20, stock: 70 },
  { talla: '61/70', precio: '$210', master: 20, stock: 80 },
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
          <h1 class="panel__titulo">Bienvenido de vuelta, Admin</h1>
          <p class="panel__subtitulo">
            Monitorea el inventario y gestiona los pedidos recientes de hoy.
          </p>
        </div>

        <div class="panel__accion">
          <!-- TODO: abrir la pantalla de nuevo pedido cuando exista. -->
          <BotonVue variante="exito">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Pedido
          </BotonVue>
        </div>
      </div>

      <section>
        <EncabezadoSeccionVue titulo="Inventario" icono="caja" />

        <TablaVue :columnas="columnasInventario" :alto-maximo="220">
          <tr v-for="fila in inventario" :key="fila.talla">
            <td>{{ fila.talla }}</td>
            <td>{{ fila.precio }}</td>
            <td class="tabla__celda--centro">{{ fila.master }}</td>
            <td class="tabla__celda--centro">{{ fila.stock }}</td>
          </tr>
        </TablaVue>
      </section>

      <section>
        <EncabezadoSeccionVue titulo="Pedidos Actuales" icono="reloj" />

        <TablaVue :columnas="columnasPedidos" :alto-maximo="200">
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
.panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1100px;
}

.panel__bienvenida {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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
  .panel {
    gap: 28px;
  }

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
