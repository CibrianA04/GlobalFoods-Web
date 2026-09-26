<script setup lang="ts">
import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue, { type EstadoPedido } from '@/componentes/ChipEstadoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TarjetaProductoVue from '@/componentes/TarjetaProductoVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
// Imagen provisional para todos los productos
import fotoCamaron from '@/assets/camaronsinCabeza.jpg'

// agregar `ruta` a cada item cuando existan sus pantallas.
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario' },
]

// Datos provisionales, luego reemplazados por los del backend
const productos = [
  {
    nombre: 'Camarón Sin Cabeza 21/25 kg',
    imagen: fotoCamaron,
    stock: '45 kg',
    precio: '$280/kg',
    disponible: true,
  },
  {
    nombre: 'Camarón Pelado 41/50 kg',
    imagen: fotoCamaron,
    stock: '15 kg',
    precio: '$280/kg',
    disponible: true,
  },
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
        <EncabezadoSeccionVue titulo="Inventario de Camarón" icono="caja">
          <!-- TODO: enlazar al inventario completo cuando exista la pantalla. -->
          <button type="button" class="panel__enlace">Ver todo</button>
        </EncabezadoSeccionVue>

        <div class="panel__productos">
          <TarjetaProductoVue
            v-for="producto in productos"
            :key="producto.nombre"
            :nombre="producto.nombre"
            :imagen="producto.imagen"
            :stock="producto.stock"
            :precio="producto.precio"
            :disponible="producto.disponible"
          >
            <template #accion>
              <!-- TODO: agregar el producto a un pedido. -->
              <BotonVue
                variante="secundario"
                solo-icono
                :aria-label="`Agregar ${producto.nombre} a un pedido`"
              >
                <IconoVue nombre="bolsa" :tamano="16" />
              </BotonVue>
            </template>
          </TarjetaProductoVue>
        </div>
      </section>

      <section>
        <EncabezadoSeccionVue titulo="Pedidos Recientes" icono="reloj" />

        <div class="panel__tabla-contenedor">
          <table class="panel__tabla">
            <thead>
              <tr>
                <th scope="col">ID Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col" class="panel__celda--derecha">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id">
                <td class="panel__id">{{ pedido.id }}</td>
                <td>
                  <p class="panel__cliente">{{ pedido.cliente }}</p>
                  <p class="panel__detalle">{{ pedido.articulos }} Items</p>
                </td>
                <td>
                  <ChipEstadoVue :estado="pedido.estado" />
                </td>
                <td class="panel__celda--derecha">
                  <p class="panel__total">{{ pedido.total }}</p>
                  <p class="panel__detalle panel__hace">
                    <IconoVue nombre="reloj" :tamano="12" />
                    {{ pedido.hace }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

.panel__enlace {
  padding: 0;
  border: 0;
  background: none;
  color: var(--gf-primario);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.panel__enlace:hover {
  text-decoration: underline;
}

.panel__enlace:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
  border-radius: 2px;
}

.panel__productos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

/* La tabla se desplaza dentro de su caja, no la página entera. */
.panel__tabla-contenedor {
  overflow-x: auto;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
}

.panel__tabla {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 14px;
}

.panel__tabla th {
  padding: 12px 16px;
  border-bottom: 1px solid var(--gf-borde);
  background: var(--gf-fondo);
  color: var(--gf-texto-tenue);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.panel__tabla td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--gf-borde);
  vertical-align: middle;
}

.panel__tabla tbody tr:last-child td {
  border-bottom: 0;
}

.panel__tabla .panel__celda--derecha {
  text-align: right;
}

.panel__id {
  color: var(--gf-texto);
  font-weight: 700;
  white-space: nowrap;
}

.panel__cliente {
  margin: 0;
  color: var(--gf-texto);
  font-weight: 500;
}

.panel__detalle {
  margin: 2px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.panel__total {
  margin: 0;
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 700;
}

.panel__hace {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .panel {
    gap: 28px;
  }

  .panel__titulo {
    font-size: 20px;
  }

  .panel__productos {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .panel__bienvenida {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
