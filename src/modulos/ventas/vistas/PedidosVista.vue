<script setup lang="ts">
// Pestaña Pedidos: todos los pedidos con filtros por estado, búsqueda, fechas y páginas de 10.
// Solo consulta; cada folio abre su detalle. El estado y los filtros viven en usarListaPedidos().

import { nextTick, onMounted, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BotonVue from '@/componentes/BotonVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import { obtenerMenuNavegacion, obtenerNombreUsuario } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import FiltrosPedidosVue from '@/modulos/ventas/componentes/FiltrosPedidosVue.vue'
import { MODALIDADES, formatearFecha, formatearKg, formatearMoneda } from '@/modulos/ventas/controladores/formatosPedido'
import { salirPorSesionVencida } from '@/modulos/ventas/controladores/sesionVencida'
import { IDS_LISTA, MENSAJES_LISTA, usarListaPedidos } from '@/modulos/ventas/controladores/usarListaPedidos'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const itemsNavegacion = obtenerMenuNavegacion()

const enrutador = useRouter()
const lista = reactive(usarListaPedidos({ alVencerSesion: () => salirPorSesionVencida(enrutador) }))

const columnas: ColumnaTabla[] = [
  { clave: 'folio', etiqueta: 'Folio' },
  { clave: 'cliente', etiqueta: 'Cliente y sucursal' },
  { clave: 'registrado', etiqueta: 'Registrado' },
  { clave: 'entrega', etiqueta: 'Entrega' },
  { clave: 'modalidad', etiqueta: 'Modalidad' },
  { clave: 'estado', etiqueta: 'Estado' },
  { clave: 'total', etiqueta: 'Total', alineacion: 'derecha' },
]

const SIN_DATO = '—'

onMounted(lista.cargar)

// "Limpiar filtros" se deshabilita al limpiar; el foco pasa a la búsqueda.
async function alLimpiar() {
  lista.limpiarFiltros()
  await nextTick()
  document.getElementById(IDS_LISTA.buscar)?.focus()
}

// Al llegar a la primera o la última página el botón se deshabilita; el foco pasa al otro.
async function alCambiarPagina(paso: 1 | -1) {
  lista.cambiarPagina(paso)
  await nextTick()
  const presionado = document.getElementById(paso === 1 ? IDS_LISTA.siguiente : IDS_LISTA.anterior)
  if (presionado instanceof HTMLButtonElement && presionado.disabled) {
    document.getElementById(paso === 1 ? IDS_LISTA.anterior : IDS_LISTA.siguiente)?.focus()
  }
}
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    :usuario="nombreUsuario"
    :items-navegacion="itemsNavegacion"
    item-activo="Pedidos"
  >
    <div class="pedidos">
      <div class="pedidos__encabezado">
        <div>
          <h1 class="pedidos__titulo">Pedidos</h1>
          <p class="pedidos__subtitulo">Consulta todos los pedidos y revisa en qué estado va cada uno.</p>
        </div>

        <div class="pedidos__accion">
          <BotonVue variante="exito" @click="enrutador.push({ name: 'nuevo-pedido' })">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo pedido
          </BotonVue>
        </div>
      </div>

      <FiltrosPedidosVue
        v-model:estatus="lista.estatus"
        v-model:criterio="lista.criterio"
        v-model:desde="lista.desde"
        v-model:hasta="lista.hasta"
        :conteos="lista.conteos"
        :error-fechas="lista.errorFechas"
        :hay-filtros="lista.hayFiltros"
        @limpiar="alLimpiar"
      />

      <TablaVue :columnas="columnas">
        <tr v-if="lista.cargando">
          <td :colspan="columnas.length" class="pedidos__mensaje">
            <p role="status">{{ MENSAJES_LISTA.cargando }}</p>
          </td>
        </tr>

        <tr v-else-if="lista.errorCarga">
          <td :colspan="columnas.length" class="pedidos__mensaje">
            <p class="pedidos__error" role="alert">{{ MENSAJES_LISTA.errorCarga }}</p>
            <div class="pedidos__reintentar">
              <BotonVue variante="secundario" compacto @click="lista.cargar">Reintentar</BotonVue>
            </div>
          </td>
        </tr>

        <tr v-else-if="!lista.hayPedidos">
          <td :colspan="columnas.length" class="pedidos__mensaje">{{ MENSAJES_LISTA.sinPedidos }}</td>
        </tr>

        <tr v-else-if="lista.totalFiltrados === 0">
          <td :colspan="columnas.length" class="pedidos__mensaje">{{ MENSAJES_LISTA.sinResultados }}</td>
        </tr>

        <template v-else>
          <tr v-for="fila in lista.filasPagina" :key="fila.id">
            <td>
              <RouterLink :to="{ name: 'detalle-pedido', params: { id: fila.id } }" class="pedidos__folio">
                #{{ fila.id }}
              </RouterLink>
            </td>
            <td>
              <p class="pedidos__cliente">{{ fila.cliente }}</p>
              <p class="pedidos__detalle">{{ fila.sucursal }}</p>
            </td>
            <td>{{ formatearFecha(fila.registrado) || SIN_DATO }}</td>
            <td>{{ fila.entrega.fechaEntrega ? formatearFecha(fila.entrega.fechaEntrega) : SIN_DATO }}</td>
            <td>
              <span v-if="fila.entrega.modalidad" class="pedidos__modalidad">
                <IconoVue :nombre="MODALIDADES[fila.entrega.modalidad].icono" :tamano="16" />
                {{ MODALIDADES[fila.entrega.modalidad].etiquetaCorta }}
              </span>
              <template v-else>{{ SIN_DATO }}</template>
            </td>
            <td><ChipEstadoVue :estado="fila.estado.chip" :etiqueta="fila.estado.etiqueta" /></td>
            <td class="tabla__celda--derecha">
              <p class="pedidos__total">{{ formatearMoneda(fila.total) }}</p>
              <p class="pedidos__detalle">{{ formatearKg(fila.totalKg) }}</p>
            </td>
          </tr>
        </template>
      </TablaVue>

      <div v-if="!lista.cargando && !lista.errorCarga && lista.totalFiltrados > 0" class="paginacion">
        <p class="paginacion__resumen" role="status">
          Mostrando {{ lista.filasPagina.length }} de {{ lista.totalFiltrados }}
          {{ lista.totalFiltrados === 1 ? 'pedido' : 'pedidos' }}
        </p>

        <div class="paginacion__controles">
          <div class="paginacion__boton">
            <BotonVue
              :id="IDS_LISTA.anterior"
              variante="secundario"
              compacto
              :deshabilitado="lista.paginaActual === 1"
              @click="alCambiarPagina(-1)"
            >
              Anterior
            </BotonVue>
          </div>
          <span class="paginacion__pagina">Página {{ lista.paginaActual }} de {{ lista.totalPaginas }}</span>
          <div class="paginacion__boton">
            <BotonVue
              :id="IDS_LISTA.siguiente"
              variante="secundario"
              compacto
              :deshabilitado="lista.paginaActual === lista.totalPaginas"
              @click="alCambiarPagina(1)"
            >
              Siguiente
            </BotonVue>
          </div>
        </div>
      </div>
    </div>
  </LayoutPanelVue>
</template>

<style scoped>
.pedidos {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pedidos :where(p) {
  margin: 0;
}

.pedidos__encabezado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.pedidos__titulo {
  margin: 0;
  color: var(--gf-texto);
  font-size: 24px;
  font-weight: 700;
}

.pedidos__subtitulo {
  margin-top: 6px;
  color: var(--gf-texto-tenue);
  font-size: 14px;
}

.pedidos__accion {
  flex: none;
}

/* .pedidos delante para ganarle al padding y al nowrap de las celdas de TablaVue. */
.pedidos .pedidos__mensaje {
  padding: 32px 16px;
  color: var(--gf-texto-tenue);
  text-align: center;
  white-space: normal;
}

.pedidos__error {
  color: var(--gf-cancelado-fg);
}

.pedidos__reintentar {
  display: inline-flex;
  margin-top: 12px;
}

.pedidos__folio {
  color: var(--gf-primario);
  font-weight: 700;
  text-decoration: none;
}

.pedidos__folio:hover {
  text-decoration: underline;
}

.pedidos__folio:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--gf-secundario);
  outline-offset: 2px;
}

.pedidos__cliente {
  color: var(--gf-texto);
  font-weight: 600;
}

.pedidos__detalle {
  margin-top: 2px;
  color: var(--gf-texto-tenue);
  font-size: 12px;
}

.pedidos__modalidad {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pedidos__total {
  color: var(--gf-texto);
  font-weight: 700;
}

.paginacion {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.paginacion__resumen,
.paginacion__pagina {
  color: var(--gf-texto-tenue);
  font-size: 13px;
}

.paginacion__controles {
  display: flex;
  align-items: center;
  gap: 12px;
}

.paginacion__boton {
  flex: none;
}

@media (max-width: 560px) {
  .pedidos__encabezado {
    flex-direction: column;
  }

  .pedidos__accion {
    width: 100%;
  }

  .paginacion__controles {
    justify-content: space-between;
    width: 100%;
  }
}
</style>
