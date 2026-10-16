<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import ModalNuevoCliente from '@/componentes/ModalNuevoCliente.vue'
import ModalConfirmacion from '@/componentes/ModalConfirmacion.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import { obtenerNombreUsuario, obtenerMenuNavegacion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { obtenerClientesAPI, crearClienteAPI, actualizarClienteAPI, eliminarClienteAPI, type ClienteAPI } from '@/modulos/administracion/servicios/servicioClientes'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const itemsNavegacion = obtenerMenuNavegacion()

// Estados generales
const clientes = ref<ClienteAPI[]>([])
const cargando = ref(true)
const errorCarga = ref('')

// Estados de modales
const mostrarModal = ref(false)
const clienteSeleccionado = ref<ClienteAPI | null>(null)
const mostrarModalConfirmacion = ref(false)
const clienteAEliminar = ref<ClienteAPI | null>(null)

// Estado para controlar qué contraseñas están visibles (guardamos el Id)
const contrasenasVisibles = ref<number[]>([])

// Columnas adaptadas para Clientes (Agregada CONTRASEÑA)
const columnasClientes: ColumnaTabla[] = [
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'usuario', etiqueta: 'USUARIO' },
  { clave: 'celular', etiqueta: 'CELULAR' },
  { clave: 'contrasena', etiqueta: 'CONTRASEÑA' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'cambios', etiqueta: 'CAMBIOS', alineacion: 'centro' },
]

const alternarContrasena = (id: number) => {
  const index = contrasenasVisibles.value.indexOf(id)
  if (index > -1) {
    contrasenasVisibles.value.splice(index, 1) // Ocultar
  } else {
    contrasenasVisibles.value.push(id) // Mostrar
  }
}

const cargarDatosClientes = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    clientes.value = await obtenerClientesAPI()
  } catch (err: any) {
    errorCarga.value = err.message || 'Ocurrió un error al cargar los clientes.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatosClientes()
})

const abrirModalCrear = () => {
  clienteSeleccionado.value = null
  mostrarModal.value = true
}

const abrirModalEditar = (cli: ClienteAPI) => {
  clienteSeleccionado.value = cli
  mostrarModal.value = true
}

const solicitarEliminarCliente = (cli: ClienteAPI) => {
  clienteAEliminar.value = cli
  mostrarModalConfirmacion.value = true
}

const guardarCliente = async (datos: { nombre: string; celular: string; usuario: string; contrasena: string }) => {
  try {
    const payload = {
      usuario: datos.usuario,
      contrasena: datos.contrasena,
      nombre: datos.nombre,
      telefono: datos.celular, 
      estatus: 1, 
    }

    if (clienteSeleccionado.value) {
      await actualizarClienteAPI(clienteSeleccionado.value.Id, payload as any)
    } else {
      await crearClienteAPI(payload as any)
    }

    mostrarModal.value = false
    await cargarDatosClientes() 
  } catch (err: any) {
    alert(err.message || 'Error al guardar el cliente')
  }
}

const confirmarEliminacion = async () => {
  if (!clienteAEliminar.value) return

  try {
    await eliminarClienteAPI(clienteAEliminar.value.Id)
    mostrarModalConfirmacion.value = false
    clienteAEliminar.value = null
    await cargarDatosClientes() 
  } catch (err: any) {
    alert(err.message || 'Error al eliminar el cliente')
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
      <!-- Encabezado de la pantalla -->
      <div class="panel__bienvenida">
        <div>
          <h1 class="panel__titulo">Clientes</h1>
          <p class="panel__subtitulo">
            Monitorea, modifica, elimina y crea las cuentas de Clientes.
          </p>
        </div>

        <div class="panel__accion">
          <BotonVue variante="exito" @click="abrirModalCrear">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Cliente
          </BotonVue>
        </div>
      </div>

      <!-- Sección de la tabla de clientes -->
      <section>
        <EncabezadoSeccionVue titulo="Clientes" icono="clientes" />

        <div v-if="cargando" class="panel__estado-carga">
          Cargando clientes...
        </div>

        <div v-else-if="errorCarga" class="panel__estado-error">
          {{ errorCarga }}
        </div>

        <TablaVue v-else :columnas="columnasClientes">
          <tr 
            v-for="cliente in clientes" 
            :key="cliente.Id"
            class="fila-clicable"
            @click="$router.push(`/detalle-cliente-vista/${cliente.Id}`)"
          >
            <td class="panel__texto-nombre">{{ cliente.Nombre }}</td>
            <td class="panel__texto-fuerte">{{ cliente.Usuario }}</td>
            <td class="panel__texto-fuerte">{{ cliente.Telefono }}</td>

            <!-- Columna de Contraseña con el ojito -->
            <td>
              <div class="panel__password-wrap" @click.stop>
                <span class="panel__texto-pass">
                  {{ contrasenasVisibles.includes(cliente.Id) ? cliente.Contrasena : '••••••••' }}
                </span>
                <button 
                  type="button" 
                  class="btn-ojo" 
                  @click.stop="alternarContrasena(cliente.Id)"
                  title="Mostrar/Ocultar contraseña"
                >
                  <IconoVue :nombre="contrasenasVisibles.includes(cliente.Id) ? 'ojo-cerrado' : 'ojo'" :tamano="16" />
                </button>
              </div>
            </td>

            <td>
              <ChipEstadoVue
                :estado="cliente.Estatus === 1 ? 'entregado' : 'en_preparacion'"
                :etiqueta="cliente.Estatus === 1 ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="tabla__celda--centro">
              <div class="panel__acciones-fila">
                <!-- Se quitó el botón de seguridad (candado) -->
                <button 
                  type="button" 
                  class="btn-accion btn-accion--editar" 
                  aria-label="Editar cliente"
                  @click.stop="abrirModalEditar(cliente)"
                >
                  <IconoVue nombre="lapiz" :tamano="16" />
                </button>
                <button 
                  type="button" 
                  class="btn-accion btn-accion--eliminar" 
                  aria-label="Eliminar cliente"
                  @click.stop="solicitarEliminarCliente(cliente)"
                >
                  <IconoVue nombre="basura" :tamano="16" />
                </button>
              </div>
            </td>
          </tr>
        </TablaVue>
      </section>
    </div>
  </LayoutPanelVue>

  <ModalNuevoCliente
    :mostrar="mostrarModal"
    :cliente-editar="clienteSeleccionado"
    @cerrar="mostrarModal = false"
    @guardar="guardarCliente"
  />

  <ModalConfirmacion
    :mostrar="mostrarModalConfirmacion"
    titulo="¿Eliminar cliente?"
    :mensaje="`¿Estás seguro de que deseas eliminar al cliente '${clienteAEliminar?.Nombre}'?`"
    texto-boton-confirmar="Eliminar"
    @cerrar="mostrarModalConfirmacion = false"
    @confirmar="confirmarEliminacion"
  />
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

.panel__accion {
  flex: none;
}

.panel__texto-fuerte {
  font-weight: 700;
  color: var(--gf-texto);
}

.panel__texto-nombre {
  font-weight: 600;
  color: var(--gf-texto);
}

.panel__acciones-fila {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Estilos para la contraseña y ojito */
.panel__password-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel__texto-pass {
  font-family: monospace;
  font-size: 14px;
  color: var(--gf-texto);
  min-width: 70px;
}

.btn-ojo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--gf-texto-tenue);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.btn-ojo:hover {
  color: var(--gf-texto);
  background: var(--gf-fondo);
}

.panel__estado-carga,
.panel__estado-error {
  padding: 24px;
  text-align: center;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
  font-size: 14px;
}

.panel__estado-error {
  color: var(--gf-cancelado-fg);
  border-color: var(--gf-cancelado-punto);
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

.fila-clicable {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.fila-clicable:hover {
  background-color: var(--gf-fondo);
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