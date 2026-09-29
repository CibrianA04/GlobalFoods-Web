<script setup lang="ts">
// Pantalla Nuevo pedido: captura cliente, productos y entrega, confirma y registra.
// El estado y las reglas viven en usarNuevoPedido(); aquí solo se conectan las secciones,
// los modales y la navegación.

import { nextTick, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import AvisoVue from '@/componentes/AvisoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import ModalAgregarProductoVue from '@/modulos/ventas/componentes/ModalAgregarProductoVue.vue'
import ModalConfirmarPedidoVue from '@/modulos/ventas/componentes/ModalConfirmarPedidoVue.vue'
import ModalDescartarPedidoVue from '@/modulos/ventas/componentes/ModalDescartarPedidoVue.vue'
import ResumenPedidoVue from '@/modulos/ventas/componentes/ResumenPedidoVue.vue'
import SeccionClienteVue from '@/modulos/ventas/componentes/SeccionClienteVue.vue'
import SeccionEntregaVue from '@/modulos/ventas/componentes/SeccionEntregaVue.vue'
import SeccionProductosVue from '@/modulos/ventas/componentes/SeccionProductosVue.vue'
import { MENSAJES, usarNuevoPedido } from '@/modulos/ventas/controladores/usarNuevoPedido'

// Elementos del menú lateral
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio', ruta: '/panel' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes', ruta: '/clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario', ruta: '/usuarios' }
]

const enrutador = useRouter()
const pedido = reactive(usarNuevoPedido())

// Cambia al limpiar el formulario para que el buscador de clientes empiece de cero.
const versionFormulario = ref(0)

const mostrarAgregarProducto = ref(false)
const mostrarConfirmacion = ref(false)
const estadoConfirmacion = ref<'confirmar' | 'exito'>('confirmar')
const folioRegistrado = ref('')
const mostrarDescartar = ref(false)
const mensajeAviso = ref('')

// Ruta a la que se quería ir cuando se pidió confirmar el descarte.
let destinoPendiente: string | null = null
// Ya se confirmó el descarte: la salida que sigue no vuelve a preguntar.
let salidaConfirmada = false

onMounted(pedido.cargarInventario)

async function avisar(texto: string) {
  // Se vacía primero para que un mensaje repetido se vuelva a mostrar y a anunciar.
  mensajeAviso.value = ''
  await nextTick()
  mensajeAviso.value = texto
}

async function alRegistrar() {
  const idConError = pedido.validar()
  if (idConError) {
    await nextTick()
    document.getElementById(idConError)?.focus()
    return
  }
  estadoConfirmacion.value = 'confirmar'
  mostrarConfirmacion.value = true
}

async function alConfirmar() {
  try {
    const folio = await pedido.registrar()
    if (folio === null) return
    folioRegistrado.value = folio
    estadoConfirmacion.value = 'exito'
    // El pedido ya quedó registrado: se limpia de inmediato para que no se pueda reenviar.
    limpiarFormulario()
  } catch {
    mostrarConfirmacion.value = false
    avisar(MENSAJES.errorRegistro)
  }
}

function limpiarFormulario() {
  pedido.reiniciar()
  versionFormulario.value += 1
  pedido.cargarInventario()
}

function irAlInicio() {
  enrutador.push('/panel')
}

function alCancelar() {
  if (!pedido.hayDatosCapturados) {
    enrutador.push('/panel')
    return
  }
  destinoPendiente = '/panel'
  mostrarDescartar.value = true
}

function alSeguirCapturando() {
  destinoPendiente = null
  mostrarDescartar.value = false
}

function alDescartar() {
  salidaConfirmada = true
  mostrarDescartar.value = false
  enrutador.push(destinoPendiente ?? '/panel')
}

// Cualquier salida con datos capturados (menú lateral, botón atrás, cerrar sesión) pide confirmar.
onBeforeRouteLeave((destino) => {
  if (salidaConfirmada || !pedido.hayDatosCapturados) return true
  if (pedido.enviando) return false

  destinoPendiente = destino.fullPath
  mostrarAgregarProducto.value = false
  mostrarConfirmacion.value = false
  mostrarDescartar.value = true
  return false
})
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    usuario="Administrador"
    :items-navegacion="itemsNavegacion"
    item-activo="Pedidos"
  >
    <div class="nuevo-pedido">
      <nav class="migas" aria-label="Ruta de navegación">
        <ol class="migas__lista">
          <li>Pedidos</li>
          <li aria-current="page">
            <span class="migas__separador" aria-hidden="true">›</span>
            Nuevo pedido
          </li>
        </ol>
      </nav>

      <h1 id="nuevo-pedido-titulo" class="nuevo-pedido__titulo">Nuevo pedido</h1>
      <p class="nuevo-pedido__subtitulo">
        Captura el cliente, los productos y los datos de entrega. Al registrarlo, el pedido recibe un folio,
        queda en estado Pendiente y aparece en la lista de almacén.
      </p>

      <div class="nuevo-pedido__rejilla">
        <form
          class="nuevo-pedido__formulario"
          novalidate
          aria-labelledby="nuevo-pedido-titulo"
          @submit.prevent
        >
          <SeccionClienteVue
            :key="versionFormulario"
            v-model="pedido.cliente"
            class="nuevo-pedido__tarjeta"
            :error="pedido.errores.cliente"
            @error-busqueda="avisar(MENSAJES.errorBusquedaClientes)"
          />

          <SeccionProductosVue
            class="nuevo-pedido__tarjeta"
            :renglones="pedido.renglones"
            :resumen="pedido.resumen"
            :errores-cantidad="pedido.erroresCantidad"
            :error="pedido.errores.productos"
            :cargando-inventario="pedido.cargandoInventario"
            :error-inventario="pedido.errorInventario"
            @agregar="mostrarAgregarProducto = true"
            @quitar="pedido.quitarRenglon"
            @cambiar-cantidad="pedido.cambiarCantidad"
            @aumentar="pedido.aumentarCantidad"
            @disminuir="pedido.disminuirCantidad"
          />

          <SeccionEntregaVue
            v-model:modalidad="pedido.modalidad"
            v-model:fecha-entrega="pedido.fechaEntrega"
            v-model:usar-direccion-registrada="pedido.usarDireccionRegistrada"
            v-model:direccion-entrega="pedido.direccionEntrega"
            v-model:referencias="pedido.referencias"
            v-model:observaciones="pedido.observaciones"
            class="nuevo-pedido__tarjeta"
            :direccion-cliente="pedido.cliente?.direccion ?? null"
            :errores="pedido.errores"
          />
        </form>

        <ResumenPedidoVue
          class="nuevo-pedido__tarjeta nuevo-pedido__resumen"
          :resumen="pedido.resumen"
          :enviando="pedido.enviando"
          @registrar="alRegistrar"
          @cancelar="alCancelar"
        />
      </div>
    </div>
  </LayoutPanelVue>

  <ModalAgregarProductoVue
    :mostrar="mostrarAgregarProducto"
    :productos="pedido.productosInventario"
    :agregados="pedido.renglones.map((renglon) => renglon.producto.productoId)"
    @cerrar="mostrarAgregarProducto = false"
    @agregar="pedido.agregarProducto"
  />

  <ModalConfirmarPedidoVue
    :mostrar="mostrarConfirmacion"
    :estado="estadoConfirmacion"
    :resumen="pedido.resumen"
    :enviando="pedido.enviando"
    :folio="folioRegistrado"
    @confirmar="alConfirmar"
    @corregir="mostrarConfirmacion = false"
    @ir-inicio="irAlInicio"
    @registrar-otro="mostrarConfirmacion = false"
  />

  <ModalDescartarPedidoVue
    :mostrar="mostrarDescartar"
    @seguir="alSeguirCapturando"
    @descartar="alDescartar"
  />

  <AvisoVue v-model="mensajeAviso" />
</template>

<style scoped>
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

.nuevo-pedido__titulo {
  margin: 12px 0 0;
  color: var(--gf-texto);
  font-size: 24px;
  font-weight: 700;
}

.nuevo-pedido__subtitulo {
  max-width: 720px;
  margin: 6px 0 0;
  color: var(--gf-texto-tenue);
  font-size: 14px;
}

.nuevo-pedido__rejilla {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 24px;
  align-items: start;
  margin-top: 20px;
}

.nuevo-pedido__formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.nuevo-pedido__tarjeta {
  padding: 20px;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
}

/* Fijo al desplazar; si no cabe en la pantalla, la lista de productos del resumen se desplaza por dentro. */
.nuevo-pedido__resumen {
  position: sticky;
  top: 24px;
  max-height: calc(100dvh - 48px);
}

@media (max-width: 900px) {
  .nuevo-pedido__titulo {
    font-size: 20px;
  }

  .nuevo-pedido__rejilla {
    grid-template-columns: minmax(0, 1fr);
  }

  .nuevo-pedido__resumen {
    position: static;
    max-height: none;
  }
}

@media (max-width: 560px) {
  .nuevo-pedido__tarjeta {
    padding: 16px;
  }
}
</style>
