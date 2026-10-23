<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import ModalNuevaSucursal from '@/componentes/ModalNuevaSucursal.vue'
import ModalConfirmacion from '@/componentes/ModalConfirmacion.vue'
// Importamos el modal del cliente
import ModalNuevoCliente from '@/componentes/ModalNuevoCliente.vue'
import { obtenerNombreUsuario, obtenerMenuNavegacion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { 
  obtenerClientePorIdAPI,
  actualizarClienteAPI, // Agregamos la función para actualizar al cliente
  obtenerSucursalesClienteAPI, 
  obtenerPedidosClienteAPI,
  crearSucursalClienteAPI,
  actualizarSucursalClienteAPI,
  eliminarSucursalClienteAPI,
  type ClienteAPI
} from '@/modulos/administracion/servicios/servicioClientes'

const route = useRoute()
const clienteId = Number(route.params.id)
const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const itemsNavegacion = obtenerMenuNavegacion()

const cliente = ref<ClienteAPI | null>(null)
const sucursales = ref<any[]>([])
const pedidos = ref<any[]>([])
const cargando = ref(true)
const errorCarga = ref('')

// Estado para el modal de editar cliente
const mostrarModalCliente = ref(false)

// Estados de modales para Sucursales
const mostrarModalSucursal = ref(false)
const sucursalSeleccionada = ref<any | null>(null)
const mostrarModalConfirmacionSucursal = ref(false)
const sucursalAEliminar = ref<any | null>(null)

// Columnas
const columnasSucursales: ColumnaTabla[] = [
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'direccion', etiqueta: 'DIRECCIÓN' },
  { clave: 'telefono', etiqueta: 'TELÉFONO' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'cambios', etiqueta: 'CAMBIOS', alineacion: 'centro' },
]

const columnasPedidos: ColumnaTabla[] = [
  { clave: 'id', etiqueta: 'ID PEDIDO' },
  { clave: 'sucursal', etiqueta: 'SUCURSAL' },
  { clave: 'fecha', etiqueta: 'FECHA' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'total', etiqueta: 'TOTAL', alineacion: 'derecha' },
]

const formatoPrecio = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

const formatearFechaNumero = (fechaNum: number) => {
  if (!fechaNum) return 'N/A'
  const fechaStr = String(fechaNum)
  if (fechaStr.length !== 8) return fechaStr
  const año = fechaStr.substring(0, 4)
  const mes = fechaStr.substring(4, 6)
  const dia = fechaStr.substring(6, 8)
  return `${dia}/${mes}/${año}`
}

const obtenerNombreSucursal = (idSucursal: number) => {
  const sucursal = sucursales.value.find(s => s.Id === idSucursal)
  return sucursal ? sucursal.NombreSucursal : `Sucursal #${idSucursal}`
}

const cargarDatos = async () => {
  if (!clienteId || isNaN(clienteId)) {
    errorCarga.value = 'ID de cliente inválido.'
    cargando.value = false
    return
  }
  cargando.value = true
  errorCarga.value = ''
  try {
    const [datosCliente, datosSucursales, datosPedidos] = await Promise.all([
      obtenerClientePorIdAPI(clienteId),
      obtenerSucursalesClienteAPI(clienteId),
      obtenerPedidosClienteAPI(clienteId)
    ])
    cliente.value = datosCliente
    sucursales.value = datosSucursales
    pedidos.value = datosPedidos
  } catch (err: any) {
    errorCarga.value = err.message || 'Error al cargar los datos del cliente.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => cargarDatos())

// -------- Lógica de Edición del Cliente --------
const abrirModalEditarCliente = () => {
  mostrarModalCliente.value = true
}

const guardarCliente = async (datos: { nombre: string; celular: string; usuario: string; contrasena: string }) => {
  try {
    const payload = {
      usuario: datos.usuario,
      contrasena: datos.contrasena,
      nombre: datos.nombre,
      telefono: datos.celular,
      estatus: cliente.value?.Estatus ?? 1
    }
    
    // Usamos "as any" para evitar el error de TypeScript y mandar las minúsculas al backend
    await actualizarClienteAPI(clienteId, payload as any)
    mostrarModalCliente.value = false
    await cargarDatos() 
  } catch (err: any) {
    alert(err.message || 'Error al guardar el cliente')
  }
}

// -------- Lógica del CRUD de Sucursales --------
const abrirModalCrearSucursal = () => {
  sucursalSeleccionada.value = null
  mostrarModalSucursal.value = true
}

const abrirModalEditarSucursal = (sucursal: any) => {
  sucursalSeleccionada.value = sucursal
  mostrarModalSucursal.value = true
}

const solicitarEliminarSucursal = (sucursal: any) => {
  sucursalAEliminar.value = sucursal
  mostrarModalConfirmacionSucursal.value = true
}

const guardarSucursal = async (datos: { nombreSucursal: string; direccion: string; telefono: string }) => {
  try {
    const payload = {
      idCliente: clienteId,
      NombreSucursal: datos.nombreSucursal,
      Direccion: datos.direccion,
      Telefono: datos.telefono,
      Estatus: 1 
    }

    if (sucursalSeleccionada.value) {
      await actualizarSucursalClienteAPI(sucursalSeleccionada.value.Id, payload)
    } else {
      await crearSucursalClienteAPI(payload)
    }
    mostrarModalSucursal.value = false
    await cargarDatos() 
  } catch (err: any) {
    alert(err.message || 'Error al guardar la sucursal')
  }
}

const confirmarEliminacionSucursal = async () => {
  if (!sucursalAEliminar.value) return
  try {
    await eliminarSucursalClienteAPI(sucursalAEliminar.value.Id)
    mostrarModalConfirmacionSucursal.value = false
    sucursalAEliminar.value = null
    await cargarDatos()
  } catch (err: any) {
    alert(err.message || 'Error al eliminar la sucursal')
  }
}
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    :usuario="nombreUsuario"
    :items-navegacion="itemsNavegacion"
    item-activo="Clientes"
  >
    <div class="panel">
      <!-- Encabezado y volver -->
      <div class="panel__bienvenida">
        <div>
          <div class="panel__encabezado-volver">
            <RouterLink to="/clientes" class="btn-volver" aria-label="Volver a clientes">
              <IconoVue nombre="flecha-izquierda" :tamano="20" />
            </RouterLink>
            <h1 class="panel__titulo">Detalle del Cliente</h1>
          </div>
          <p class="panel__subtitulo">Monitorea el historial de pedidos y sucursales de este cliente.</p>
        </div>
      </div>

      <div v-if="cargando" class="panel__estado-carga">Cargando información del cliente...</div>
      <div v-else-if="errorCarga" class="panel__estado-error">{{ errorCarga }}</div>

      <template v-else-if="cliente">
        <!-- Tarjeta del cliente -->
        <div class="tarjeta-cliente">
          <div class="tarjeta-cliente__encabezado">
            <h2 class="tarjeta-cliente__nombre">{{ cliente.Nombre }}</h2>
            <div class="tarjeta-cliente__acciones">
              <!-- Se agregó el evento click aquí -->
              <button 
                type="button" 
                class="btn-accion btn-accion--editar" 
                aria-label="Editar cliente"
                @click="abrirModalEditarCliente"
              >
                <IconoVue nombre="lapiz" :tamano="16" />
              </button>
            </div>
          </div>
          <div class="tarjeta-cliente__tabla-wrap">
            <table class="tarjeta-cliente__tabla">
              <thead><tr><th>USUARIO</th><th>TELÉFONO</th><th>ESTADO</th></tr></thead>
              <tbody>
                <tr>
                  <td class="panel__texto-fuerte">{{ cliente.Usuario }}</td>
                  <td class="panel__texto-fuerte">{{ cliente.Telefono || 'N/A' }}</td>
                  <td><ChipEstadoVue :estado="cliente.Estatus === 1 ? 'entregado' : 'en_preparacion'" :etiqueta="cliente.Estatus === 1 ? 'Activo' : 'Inactivo'" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN SUCURSALES -->
        <section>
          <EncabezadoSeccionVue titulo="Sucursales" icono="usuario">
            <BotonVue variante="exito" @click="abrirModalCrearSucursal">
              <IconoVue nombre="mas" :tamano="16" />
              Nueva Sucursal
            </BotonVue>
          </EncabezadoSeccionVue>

          <TablaVue v-if="sucursales.length > 0" :columnas="columnasSucursales">
            <tr v-for="suc in sucursales" :key="suc.Id">
              <td class="panel__texto-nombre">{{ suc.NombreSucursal }}</td>
              <td>{{ suc.Direccion }}</td>
              <td class="panel__texto-fuerte">{{ suc.Telefono || 'N/A' }}</td>
              <td>
                <ChipEstadoVue 
                  :estado="suc.Estatus === 1 ? 'entregado' : 'en_preparacion'" 
                  :etiqueta="suc.Estatus === 1 ? 'Activa' : 'Inactiva'" 
                />
              </td>
              <td class="tabla__celda--centro">
                <div class="panel__acciones-fila">
                  <button type="button" class="btn-accion btn-accion--editar" @click="abrirModalEditarSucursal(suc)">
                    <IconoVue nombre="lapiz" :tamano="16" />
                  </button>
                  <button type="button" class="btn-accion btn-accion--eliminar" @click="solicitarEliminarSucursal(suc)">
                    <IconoVue nombre="basura" :tamano="16" />
                  </button>
                </div>
              </td>
            </tr>
          </TablaVue>
          <div v-else class="panel__estado-vacio">
            Este cliente no tiene sucursales registradas.
          </div>
        </section>

        <!-- SECCIÓN PEDIDOS -->
        <section>
          <EncabezadoSeccionVue titulo="Historial de Pedidos" icono="reloj" />
          <TablaVue v-if="pedidos.length > 0" :columnas="columnasPedidos">
            <tr v-for="ped in pedidos" :key="ped.Id">
              <td class="panel__id">#{{ ped.Id }}</td>
              <td class="panel__texto-nombre">{{ obtenerNombreSucursal(ped.IdSucursal) }}</td>
              <td>{{ formatearFechaNumero(ped.Fecha) }}</td>
              <td><ChipEstadoVue :estado="ped.Estatus === 1 ? 'entregado' : 'pendiente'" :etiqueta="ped.Estatus === 1 ? 'Completado' : 'Pendiente'" /></td>
              <td class="tabla__celda--derecha">
                <p class="panel__total">{{ formatoPrecio.format(ped.Total) }}</p>
                <p class="panel__detalle">{{ ped.TotalKG }} KG</p>
              </td>
            </tr>
          </TablaVue>
          <div v-else class="panel__estado-vacio">Este cliente no tiene pedidos registrados.</div>
        </section>
      </template>
    </div>
  </LayoutPanelVue>

  <!-- Modal Editar Cliente -->
  <ModalNuevoCliente
    :mostrar="mostrarModalCliente"
    :cliente-editar="cliente"
    @cerrar="mostrarModalCliente = false"
    @guardar="guardarCliente"
  />

  <!-- Modales Sucursales -->
  <ModalNuevaSucursal
    :mostrar="mostrarModalSucursal"
    :sucursal-editar="sucursalSeleccionada"
    @cerrar="mostrarModalSucursal = false"
    @guardar="guardarSucursal"
  />

  <ModalConfirmacion
    :mostrar="mostrarModalConfirmacionSucursal"
    titulo="¿Eliminar sucursal?"
    :mensaje="`¿Estás seguro de que deseas eliminar la sucursal '${sucursalAEliminar?.NombreSucursal}'?`"
    texto-boton-confirmar="Eliminar"
    @cerrar="mostrarModalConfirmacionSucursal = false"
    @confirmar="confirmarEliminacionSucursal"
  />
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

.panel__estado-carga,
.panel__estado-error,
.panel__estado-vacio {
  padding: 24px;
  text-align: center;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio, 8px);
  background: var(--gf-superficie);
  font-size: 14px;
}

.panel__estado-error {
  color: var(--gf-cancelado-fg);
  border-color: var(--gf-cancelado-punto);
}

.panel__estado-vacio {
  color: var(--gf-texto-tenue);
  border-style: dashed;
}

.tarjeta-cliente {
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio, 8px);
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

.panel__acciones-fila {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

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