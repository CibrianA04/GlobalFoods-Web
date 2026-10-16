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
import { obtenerNombreUsuario, obtenerMenuNavegacion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import { obtenerUsuarios, crearUsuarioAPI, actualizarUsuarioAPI, eliminarUsuarioAPI, type UsuarioAPI, type DatosFormularioUsuario } from '@/modulos/administracion/servicios/servicioUsuarios'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'
const itemsNavegacion = obtenerMenuNavegacion()

// Estados generales
const usuarios = ref<UsuarioAPI[]>([])
const cargando = ref(true)
const errorCarga = ref('')

// Estados de modales
const mostrarModal = ref(false)
const usuarioSeleccionado = ref<UsuarioAPI | null>(null)
const mostrarModalConfirmacion = ref(false)
const usuarioAEliminar = ref<UsuarioAPI | null>(null)

// Estado para controlar qué contraseñas están visibles (guardamos el Id)
const contrasenasVisibles = ref<number[]>([])

// Columnas adaptadas para Usuarios (Agregada CONTRASEÑA)
const columnasUsuarios: ColumnaTabla[] = [
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'usuario', etiqueta: 'USUARIO' },
  { clave: 'rol', etiqueta: 'ROL' },
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

const abrirModalEditar = (usu: UsuarioAPI) => {
  usuarioSeleccionado.value = usu
  mostrarModal.value = true
}

const solicitarEliminarUsuario = (usu: UsuarioAPI) => {
  usuarioAEliminar.value = usu
  mostrarModalConfirmacion.value = true
}

const guardarUsuario = async (datos: { nombre: string; tipoUsuario: string; usuario: string; contrasena: string }) => {
  try {
    const payload: DatosFormularioUsuario = {
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

    mostrarModal.value = false
    await cargarDatosUsuarios()
  } catch (err: any) {
    alert(err.message || 'Error al guardar el usuario')
  }
}

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
      <!-- Encabezado de la pantalla -->
      <div class="panel__bienvenida">
        <div>
          <h1 class="panel__titulo">Usuarios</h1>
          <p class="panel__subtitulo">
            Monitorea, modifica, elimina y crea cuentas de acceso al sistema.
          </p>
        </div>

        <div class="panel__accion">
          <BotonVue variante="exito" @click="abrirModalCrear">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Usuario
          </BotonVue>
        </div>
      </div>

      <!-- Sección de la tabla de usuarios -->
      <section>
        <EncabezadoSeccionVue titulo="Usuarios del Sistema" icono="usuario" />

        <div v-if="cargando" class="panel__estado-carga">
          Cargando usuarios...
        </div>

        <div v-else-if="errorCarga" class="panel__estado-error">
          {{ errorCarga }}
        </div>

        <TablaVue v-else :columnas="columnasUsuarios">
          <tr 
            v-for="usuario in usuarios" 
            :key="usuario.Id"
          >
            <td class="panel__texto-nombre">{{ usuario.Nombre }}</td>
            <td class="panel__texto-fuerte">{{ usuario.Usuario }}</td>
            <td class="panel__texto-fuerte">{{ usuario.TipoUsuario }}</td>
            
            <!-- Columna de Contraseña con el ojito -->
            <td>
              <div class="panel__password-wrap">
                <span class="panel__texto-pass">
                  {{ contrasenasVisibles.includes(usuario.Id) ? usuario.Contrasena : '••••••••' }}
                </span>
                <button 
                  type="button" 
                  class="btn-ojo" 
                  @click="alternarContrasena(usuario.Id)"
                  title="Mostrar/Ocultar contraseña"
                >
                  <IconoVue :nombre="contrasenasVisibles.includes(usuario.Id) ? 'ojo-cerrado' : 'ojo'" :tamano="16" />
                </button>
              </div>
            </td>

            <td>
              <ChipEstadoVue
                :estado="usuario.Estatus === 1 ? 'entregado' : 'en_preparacion'"
                :etiqueta="usuario.Estatus === 1 ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="tabla__celda--centro">
              <div class="panel__acciones-fila">
                <!-- Se quitó el botón de seguridad (candado) -->
                <button 
                  type="button" 
                  class="btn-accion btn-accion--editar" 
                  aria-label="Editar usuario"
                  @click="abrirModalEditar(usuario)"
                >
                  <IconoVue nombre="lapiz" :tamano="16" />
                </button>
                <button 
                  type="button" 
                  class="btn-accion btn-accion--eliminar" 
                  aria-label="Eliminar usuario"
                  @click="solicitarEliminarUsuario(usuario)"
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

  <ModalNuevoUsuario
    :mostrar="mostrarModal"
    :usuario-editar="usuarioSeleccionado"
    @cerrar="mostrarModal = false"
    @guardar="guardarUsuario"
  />

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