<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import ModalNuevoUsuario from '@/componentes/ModalNuevoUsuario.vue'
import ModalConfirmacion from '@/componentes/ModalConfirmacion.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import {
  obtenerUsuarios,
  crearUsuarioAPI,
  actualizarUsuarioAPI,
  eliminarUsuarioAPI,
  type UsuarioAPI,
} from '../servicios/servicioUsuarios'
import { obtenerNombreUsuario } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'

const mostrarModal = ref(false)
const usuarioSeleccionado = ref<UsuarioAPI | null>(null)

// Estados para el modal de eliminación
const mostrarModalConfirmacion = ref(false)
const usuarioAEliminar = ref<UsuarioAPI | null>(null)

const usuarios = ref<UsuarioAPI[]>([])
const cargando = ref(true)
const errorCarga = ref('')

const contrasenasVisibles = ref<Set<number>>(new Set())

const toggleMostrarContrasena = (id: number) => {
  if (contrasenasVisibles.value.has(id)) {
    contrasenasVisibles.value.delete(id)
  } else {
    contrasenasVisibles.value.add(id)
  }
}

const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio', ruta: '/panel' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes', ruta: '/clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario', ruta: '/usuarios' },
]

const columnasUsuarios: ColumnaTabla[] = [
  { clave: 'tipo', etiqueta: 'TIPO' },
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'usuario', etiqueta: 'USUARIO' },
  { clave: 'contrasena', etiqueta: 'CONTRASEÑA' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'cambios', etiqueta: 'CAMBIOS', alineacion: 'centro' },
]

const cargarDatosUsuarios = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    usuarios.value = await obtenerUsuarios()
  } catch (err: any) {
    errorCarga.value = err.message || 'Ocurrió un error al cargar los usuarios.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatosUsuarios()
})

const abrirModalCrear = () => {
  usuarioSeleccionado.value = null
  mostrarModal.value = true
}

const abrirModalEditar = (usr: UsuarioAPI) => {
  usuarioSeleccionado.value = usr
  mostrarModal.value = true
}

const guardarUsuario = async (datos: {
  tipoUsuario: string
  nombre: string
  usuario: string
  contrasena: string
}) => {
  try {
    const payload = {
      usuario: datos.usuario,
      contrasena: datos.contrasena,
      nombre: datos.nombre,
      tipoUsuario: datos.tipoUsuario,
      estatus: 1,
    }

    if (usuarioSeleccionado.value) {
      await actualizarUsuarioAPI(usuarioSeleccionado.value.Id, payload)
    } else {
      await crearUsuarioAPI(payload)
    }

    await cargarDatosUsuarios()
  } catch (err: any) {
    alert(err.message || 'Error al guardar el usuario')
  }
}

// Abrir el modal de confirmación pasando el usuario seleccionado
const solicitarEliminarUsuario = (usr: UsuarioAPI) => {
  usuarioAEliminar.value = usr
  mostrarModalConfirmacion.value = true
}

// Confirmar y eliminar a través de la API
const confirmarEliminacion = async () => {
  if (!usuarioAEliminar.value) return

  try {
    await eliminarUsuarioAPI(usuarioAEliminar.value.Id)
    mostrarModalConfirmacion.value = false
    usuarioAEliminar.value = null
    await cargarDatosUsuarios()
  } catch (err: any) {
    alert(err.message || 'Error al eliminar el usuario')
  }
}
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    :usuario="nombreUsuario"
    :items-navegacion="itemsNavegacion"
    item-activo="Usuarios"
  >
    <div class="panel">
      <div class="panel__bienvenida">
        <div>
          <h1 class="panel__titulo">USUARIOS</h1>
          <p class="panel__subtitulo">
            Monitorea, modifica, elimina y crea las cuentas ingresadas.
          </p>
        </div>

        <div class="panel__accion">
          <BotonVue variante="exito" @click="abrirModalCrear">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Usuario
          </BotonVue>
        </div>
      </div>

      <section>
        <EncabezadoSeccionVue titulo="Usuarios" icono="usuario" />

        <div v-if="cargando" class="panel__estado-carga">
          Cargando usuarios...
        </div>

        <div v-else-if="errorCarga" class="panel__estado-error">
          {{ errorCarga }}
        </div>

        <TablaVue v-else :columnas="columnasUsuarios">
          <tr v-for="usr in usuarios" :key="usr.Id">
            <td class="panel__texto-fuerte">{{ usr.TipoUsuario || 'Empleado' }}</td>
            <td class="panel__texto-nombre">{{ usr.Nombre }}</td>
            <td class="panel__texto-fuerte">{{ usr.Usuario }}</td>
            <td class="panel__texto-fuerte">
              <div class="panel__contrasena-celda">
                <span>
                  <template v-if="contrasenasVisibles.has(usr.Id)">
                    {{ usr.Contraseña || (usr as any).Contrasena || 'Sin contraseña' }}
                  </template>
                  <template v-else>
                    ••••••••
                  </template>
                </span>
                <button
                  type="button"
                  class="btn-ojo"
                  :aria-label="contrasenasVisibles.has(usr.Id) ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="toggleMostrarContrasena(usr.Id)"
                >
                  <IconoVue nombre="ojo" :tamano="16" />
                </button>
              </div>
            </td>
            <td>
              <ChipEstadoVue
                :estado="usr.Estatus === 1 ? 'entregado' : 'en_preparacion'"
                :etiqueta="usr.Estatus === 1 ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="tabla__celda--centro">
              <div class="panel__acciones-fila">
                <button
                  type="button"
                  class="btn-accion btn-accion--editar"
                  aria-label="Editar usuario"
                  @click="abrirModalEditar(usr)"
                >
                  <IconoVue nombre="lapiz" :tamano="16" />
                </button>
                <button
                  type="button"
                  class="btn-accion btn-accion--eliminar"
                  aria-label="Eliminar usuario"
                  @click="solicitarEliminarUsuario(usr)"
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

  <!-- Modal para crear / editar usuario -->
  <ModalNuevoUsuario
    :mostrar="mostrarModal"
    :usuario-editar="usuarioSeleccionado"
    @cerrar="mostrarModal = false"
    @guardar="guardarUsuario"
  />

  <!-- Modal para confirmar eliminación -->
  <ModalConfirmacion
    :mostrar="mostrarModalConfirmacion"
    titulo="¿Eliminar usuario?"
    :mensaje="`¿Estás seguro de que deseas eliminar al usuario '${usuarioAEliminar?.Nombre}'?`"
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
  letter-spacing: 0.02em;
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

.panel__contrasena-celda {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-ojo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 0;
  background: none;
  color: var(--gf-texto-tenue);
  cursor: pointer;
  transition: color 0.15s ease;
}

.btn-ojo:hover {
  color: var(--gf-primario);
}

.panel__acciones-fila {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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