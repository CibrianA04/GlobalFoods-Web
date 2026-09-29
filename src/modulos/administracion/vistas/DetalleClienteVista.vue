<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'

// Navegación lateral
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio', ruta: '/panel' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes', ruta: '/clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario', ruta: '/usuarios' }
]

// Columnas para Sucursales
const columnasSucursales: ColumnaTabla[] = [
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'direccion', etiqueta: 'Direccion' },
]

// Columnas para Historial de Pedidos
const columnasPedidos: ColumnaTabla[] = [
  { clave: 'id', etiqueta: 'ID PEDIDO' },
  { clave: 'sucursal', etiqueta: 'Sucursal' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'total', etiqueta: 'TOTAL', alineacion: 'derecha' },
]

// Datos de la sucursales
const sucursales = [
  {
    id: 1,
    nombre: 'Las Quintas',
    direccion: 'Blvrd Sinaloa 811-1395, Las Quintas, 80060 Culiacán Rosales, Sin.',
  },
  {
    id: 2,
    nombre: 'Barrancos',
    direccion: 'Blvd. P.º de los Ganaderos 4801, Infonavit Barrancos, Barrancos, 80189 Culiacán Rosales, Sin.',
  },
]

// Datos del historial de pedidos
const pedidos = [
  {
    id: '#12345',
    sucursal: 'Las Quintas',
    estado: 'entregado' as const,
    total: '$560',
    hace: 'hace 5 min',
  },
  {
    id: '#12346',
    sucursal: 'Barrancos',
    estado: 'entregado' as const,
    total: '$1,450',
    hace: 'hace 20 min',
  },
  {
    id: '#12347',
    sucursal: 'Barrancos',
    estado: 'entregado' as const,
    total: '$980',
    hace: 'hace 1 hora',
  },
]
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    usuario="Administrador"
    :items-navegacion="itemsNavegacion"
    item-activo="Clientes"
  >
    <div class="panel">
      <!-- Encabezado con botón de volver -->
      <div class="panel__bienvenida">
        <div>
          <div class="panel__encabezado-volver">
            <RouterLink to="/clientes" class="btn-volver" aria-label="Volver a clientes">
              <IconoVue nombre="flecha-izquierda" :tamano="20" />
            </RouterLink>
            <h1 class="panel__titulo">Cliente</h1>
          </div>
          <p class="panel__subtitulo">
            Monitorea, modifica, elimina las cuentas de Clientes.
          </p>
        </div>
      </div>

      <!-- Tarjeta de información principal del cliente -->
      <div class="tarjeta-cliente">
        <div class="tarjeta-cliente__encabezado">
          <h2 class="tarjeta-cliente__nombre">Restaurante Mar Y Tierra</h2>
          <div class="tarjeta-cliente__acciones">
            <button type="button" class="btn-accion btn-accion--editar" aria-label="Editar cliente">
              <IconoVue nombre="lapiz" :tamano="16" />
            </button>
            <button type="button" class="btn-accion btn-accion--eliminar" aria-label="Eliminar cliente">
              <IconoVue nombre="basura" :tamano="16" />
            </button>
          </div>
        </div>

        <div class="tarjeta-cliente__tabla-wrap">
          <table class="tarjeta-cliente__tabla">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>CELULAR</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="panel__texto-fuerte">MYT123</td>
                <td class="panel__texto-fuerte">6670000000</td>
                <td>
                  <ChipEstadoVue estado="entregado" etiqueta="Activo" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sección de Sucursales -->
      <section>
        <EncabezadoSeccionVue titulo="Sucursales" icono="usuario">
          <BotonVue variante="exito">
            <IconoVue nombre="mas" :tamano="16" />
            Nueva Sucursal
          </BotonVue>
        </EncabezadoSeccionVue>

        <TablaVue :columnas="columnasSucursales">
          <tr v-for="suc in sucursales" :key="suc.id">
            <td class="panel__texto-nombre">{{ suc.nombre }}</td>
            <td class="panel__texto-fuerte">{{ suc.direccion }}</td>
          </tr>
        </TablaVue>
      </section>

      <!-- Sección Historial de Pedidos -->
      <section>
        <EncabezadoSeccionVue titulo="Historial de Pedidos" icono="reloj" />

        <TablaVue :columnas="columnasPedidos">
          <tr v-for="ped in pedidos" :key="ped.id">
            <td class="panel__id">{{ ped.id }}</td>
            <td class="panel__texto-nombre">{{ ped.sucursal }}</td>
            <td>
              <ChipEstadoVue :estado="ped.estado" />
            </td>
            <td class="tabla__celda--derecha">
              <p class="panel__total">{{ ped.total }}</p>
              <p class="panel__detalle panel__hace">
                <IconoVue nombre="reloj" :tamano="12" />
                {{ ped.hace }}
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

.panel__encabezado-volver {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--gf-texto);
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.btn-volver:hover {
  opacity: 0.7;
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

/* Tarjeta principal del cliente */
.tarjeta-cliente {
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
  padding: 20px 24px;
}

.tarjeta-cliente__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tarjeta-cliente__nombre {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--gf-texto);
}

.tarjeta-cliente__acciones {
  display: flex;
  gap: 8px;
}

.tarjeta-cliente__tabla-wrap {
  overflow-x: auto;
}

.tarjeta-cliente__tabla {
  width: 100%;
  border-collapse: collapse;
}

.tarjeta-cliente__tabla th {
  padding: 8px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: var(--gf-texto-tenue);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--gf-fondo);
}

.tarjeta-cliente__tabla td {
  padding: 12px;
  vertical-align: middle;
}

.panel__id {
  font-weight: 700;
  color: var(--gf-texto);
}

.panel__texto-fuerte {
  font-weight: 700;
  color: var(--gf-texto);
}

.panel__texto-nombre {
  font-weight: 600;
  color: var(--gf-texto);
}

.panel__total {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.panel__detalle {
  margin: 2px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.panel__hace {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

/* Botones de acción */
.btn-accion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.btn-accion--editar {
  background: var(--gf-borde);
  color: var(--gf-texto-tenue);
}

.btn-accion--editar:hover {
  background: color-mix(in srgb, var(--gf-borde) 80%, var(--gf-texto));
}

.btn-accion--eliminar {
  background: var(--gf-cancelado-bg);
  color: var(--gf-cancelado-fg);
}

.btn-accion--eliminar:hover {
  background: color-mix(in srgb, var(--gf-cancelado-bg) 80%, var(--gf-cancelado-fg));
}

@media (max-width: 900px) {
  .panel {
    gap: 28px;
  }

  .panel__titulo {
    font-size: 20px;
  }
}
</style>