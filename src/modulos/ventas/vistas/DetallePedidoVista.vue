<script setup lang="ts">
// Detalle de un pedido, solo consulta: avance, cliente y entrega, y productos.
// No lleva "Cancelar pedido" ni la tarjeta "Historial del pedido" del diseño: la API todavía no
// tiene estado Cancelado ni guarda los cambios de estado con su fecha y hora. Agregarlos cuando
// el backend los tenga.

import { onMounted, reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import { obtenerMenuNavegacion, obtenerNombreUsuario } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import AvancePedidoVue from '@/modulos/ventas/componentes/AvancePedidoVue.vue'
import { MODALIDADES, formatearFecha, formatearKg, formatearMoneda } from '@/modulos/ventas/controladores/formatosPedido'
import { salirPorSesionVencida } from '@/modulos/ventas/controladores/sesionVencida'
import {
  MENSAJES_DETALLE,
  mensajeNoEncontrado,
  usarDetallePedido,
} from '@/modulos/ventas/controladores/usarDetallePedido'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const itemsNavegacion = obtenerMenuNavegacion()

const enrutador = useRouter()
// La ruta solo acepta dígitos (/pedidos/:id(\d+)).
const id = Number(useRoute().params.id)
const consulta = reactive(usarDetallePedido(id, { alVencerSesion: () => salirPorSesionVencida(enrutador) }))

const columnasProductos: ColumnaTabla[] = [
  { clave: 'talla', etiqueta: 'Talla' },
  { clave: 'cantidad', etiqueta: 'Cantidad', alineacion: 'derecha' },
  { clave: 'precio', etiqueta: 'Precio por kg', alineacion: 'derecha' },
  { clave: 'subtotal', etiqueta: 'Subtotal', alineacion: 'derecha' },
]

const SIN_DATO = '—'

onMounted(consulta.cargar)
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    :usuario="nombreUsuario"
    :items-navegacion="itemsNavegacion"
    item-activo="Pedidos"
  >
    <div class="detalle">
      <nav class="migas" aria-label="Ruta de navegación">
        <ol class="migas__lista">
          <li><RouterLink :to="{ name: 'pedidos' }" class="migas__enlace">Pedidos</RouterLink></li>
          <li aria-current="page">
            <span class="migas__separador" aria-hidden="true">›</span>
            Pedido #{{ id }}
          </li>
        </ol>
      </nav>

      <div class="detalle__encabezado">
        <RouterLink :to="{ name: 'pedidos' }" class="btn-regresar" aria-label="Volver a pedidos">
          <IconoVue nombre="flecha-izquierda" :tamano="20" />
        </RouterLink>
        <h1 class="detalle__titulo">Pedido #{{ id }}</h1>
        <ChipEstadoVue v-if="consulta.pedido" :estado="consulta.pedido.estado.chip" :etiqueta="consulta.pedido.estado.etiqueta" />
      </div>

      <p v-if="consulta.pedido" class="detalle__subtitulo">
        Registrado el {{ formatearFecha(consulta.pedido.registrado) || SIN_DATO }}.
      </p>

      <p v-if="consulta.cargando" class="detalle__mensaje" role="status">{{ MENSAJES_DETALLE.cargando }}</p>

      <div v-else-if="consulta.noEncontrado" class="detalle__mensaje">
        <p>{{ mensajeNoEncontrado(id) }}</p>
        <RouterLink :to="{ name: 'pedidos' }" class="detalle__enlace">Volver a Pedidos</RouterLink>
      </div>

      <div v-else-if="consulta.errorCarga" class="detalle__mensaje">
        <p class="detalle__error" role="alert">{{ MENSAJES_DETALLE.errorCarga }}</p>
        <div class="detalle__reintentar">
          <BotonVue variante="secundario" compacto @click="consulta.cargar">Reintentar</BotonVue>
        </div>
      </div>

      <template v-else-if="consulta.pedido">
        <AvancePedidoVue :estatus="consulta.pedido.estado.estatus" />

        <section class="tarjeta">
          <EncabezadoSeccionVue titulo="Cliente y entrega" icono="clientes" />

          <dl class="datos">
            <div class="datos__dato">
              <dt>Cliente</dt>
              <dd class="datos__fuerte">{{ consulta.pedido.cliente }}</dd>
            </div>
            <div class="datos__dato">
              <dt>Sucursal</dt>
              <dd>{{ consulta.pedido.sucursal }}</dd>
            </div>
            <div class="datos__dato">
              <dt>Dirección de entrega</dt>
              <dd>{{ consulta.pedido.direccionEntrega ?? SIN_DATO }}</dd>
            </div>
            <div class="datos__dato">
              <dt>Teléfono de la sucursal</dt>
              <dd>{{ consulta.pedido.telefonoSucursal ?? SIN_DATO }}</dd>
            </div>
            <div class="datos__dato">
              <dt>Modalidad</dt>
              <dd>
                <span v-if="consulta.pedido.modalidad" class="datos__icono">
                  <IconoVue :nombre="MODALIDADES[consulta.pedido.modalidad].icono" :tamano="16" />
                  {{ MODALIDADES[consulta.pedido.modalidad].etiquetaCorta }}
                </span>
                <template v-else>{{ SIN_DATO }}</template>
              </dd>
            </div>
            <div class="datos__dato">
              <dt>Fecha requerida</dt>
              <dd>
                <span v-if="consulta.pedido.fechaEntrega" class="datos__icono">
                  <IconoVue nombre="calendario" :tamano="16" />
                  {{ formatearFecha(consulta.pedido.fechaEntrega) }}
                </span>
                <template v-else>{{ SIN_DATO }}</template>
              </dd>
            </div>
            <div class="datos__dato datos__dato--ancho">
              <dt>Referencias</dt>
              <dd>{{ consulta.pedido.referencias ?? SIN_DATO }}</dd>
            </div>
            <div class="datos__dato datos__dato--ancho">
              <dt>Observaciones</dt>
              <dd :class="{ datos__notas: consulta.pedido.notas }">{{ consulta.pedido.notas ?? SIN_DATO }}</dd>
            </div>
          </dl>
        </section>

        <section class="tarjeta">
          <EncabezadoSeccionVue titulo="Productos" icono="caja" />

          <TablaVue :columnas="columnasProductos">
            <tr v-for="(linea, indice) in consulta.pedido.lineas" :key="indice">
              <td class="productos__talla">Camarón {{ linea.talla }}</td>
              <td class="tabla__celda--derecha">{{ formatearKg(linea.cantidadKg) }}</td>
              <td class="tabla__celda--derecha">{{ formatearMoneda(linea.precioKg) }}</td>
              <td class="tabla__celda--derecha">{{ formatearMoneda(linea.subtotal) }}</td>
            </tr>
            <tr v-if="consulta.pedido.lineas.length === 0">
              <td :colspan="columnasProductos.length" class="productos__vacio">Este pedido no tiene productos.</td>
            </tr>
            <tr class="productos__total">
              <td>Total</td>
              <td class="tabla__celda--derecha">{{ formatearKg(consulta.pedido.totalKg) }}</td>
              <td></td>
              <td class="tabla__celda--derecha productos__importe">{{ formatearMoneda(consulta.pedido.total) }}</td>
            </tr>
          </TablaVue>
        </section>
      </template>
    </div>
  </LayoutPanelVue>
</template>

<style scoped>
.detalle {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
}

.detalle :where(p, dl, dd) {
  margin: 0;
}

.migas__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  color: var(--gf-texto-tenue);
  font-size: 13px;
  list-style: none;
}

.migas__lista li[aria-current='page'] {
  color: var(--gf-texto);
}

.migas__separador {
  margin-right: 8px;
  color: var(--gf-texto-tenue);
}

.migas__enlace,
.detalle__enlace {
  color: var(--gf-secundario);
  font-weight: 600;
  text-decoration: none;
}

.migas__enlace:hover,
.detalle__enlace:hover {
  text-decoration: underline;
}

.detalle__encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.btn-regresar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--gf-borde);
  border-radius: 50%;
  background: var(--gf-superficie);
  color: var(--gf-texto);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.btn-regresar:hover {
  border-color: var(--gf-texto-tenue);
  background: var(--gf-fondo);
}

.btn-regresar:focus-visible {
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.detalle__titulo {
  margin: 0;
  color: var(--gf-texto);
  font-size: 24px;
  font-weight: 700;
}

.detalle__subtitulo {
  margin-top: -8px;
  color: var(--gf-texto-tenue);
  font-size: 14px;
}

.detalle__mensaje {
  padding: 32px 16px;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  color: var(--gf-texto-tenue);
  font-size: 14px;
  text-align: center;
}

.detalle__mensaje > p + .detalle__enlace {
  display: inline-block;
  margin-top: 12px;
}

.detalle__error {
  color: var(--gf-cancelado-fg);
}

.detalle__reintentar {
  display: inline-flex;
  margin-top: 12px;
}

.tarjeta {
  padding: 20px;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
}

.datos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
}

.datos__dato--ancho {
  grid-column: 1 / -1;
}

.datos__dato dt {
  margin-bottom: 4px;
  color: var(--gf-texto-tenue);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.datos__dato dd {
  color: var(--gf-texto);
  font-size: 14px;
  overflow-wrap: anywhere;
}

.datos__fuerte {
  font-weight: 700;
}

.datos__icono {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.datos .datos__notas {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--gf-fondo);
}

.productos__talla {
  font-weight: 600;
}

/* .tarjeta delante para ganarle a los estilos de las celdas de TablaVue. */
.tarjeta .productos__vacio {
  padding: 24px 16px;
  color: var(--gf-texto-tenue);
  text-align: center;
}

.tarjeta .productos__total td {
  background: var(--gf-fondo);
  font-weight: 700;
}

.productos__importe {
  color: var(--gf-primario);
  font-size: 16px;
}

@media (max-width: 640px) {
  .detalle__titulo {
    font-size: 20px;
  }

  .datos {
    grid-template-columns: minmax(0, 1fr);
  }

  .tarjeta {
    padding: 16px;
  }
}
</style>
