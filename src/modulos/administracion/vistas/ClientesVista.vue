<script setup lang="ts">
import { ref } from 'vue'
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import ModalNuevoCliente from '@/componentes/ModalNuevoCliente.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'
import { obtenerNombreUsuario } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

const nombreUsuario = obtenerNombreUsuario() || 'Usuario'

// Estado para controlar la visibilidad del modal
const mostrarModal = ref(false)

// Elementos del menú lateral
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio', ruta: '/panel' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes', ruta: '/clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario', ruta: '/usuarios' }
]

// Columnas de la tabla según el diseño de Figma
const columnasClientes: ColumnaTabla[] = [
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'usuario', etiqueta: 'USUARIO' },
  { clave: 'celular', etiqueta: 'CELULAR' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'cambios', etiqueta: 'CAMBIOS', alineacion: 'centro' },
]

interface Cliente {
  id: number
  nombre: string
  usuario: string
  celular: string
  estado: 'activo' | 'inactivo'
}

// Datos de ejemplo según la captura de Figma
const clientes = ref<Cliente[]>([
  {
    id: 1,
    nombre: 'Restaurante Mar Y Tierra',
    usuario: 'MYT123',
    celular: '6670000000',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Mariscos El Faro',
    usuario: 'MEF123',
    celular: '6670000000',
    estado: 'inactivo',
  },
])

// Función que recibe los datos desde el modal cuando se hace clic en Registrar
const registrarNuevoCliente = (datos: { nombre: string; celular: string; usuario: string; contrasena: string }) => {
  const nuevoId = clientes.value.length + 1
  clientes.value.push({
    id: nuevoId,
    nombre: datos.nombre,
    usuario: datos.usuario,
    celular: datos.celular,
    estado: 'activo'
  })
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
          <BotonVue variante="exito" @click="mostrarModal = true">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Cliente
          </BotonVue>
        </div>
      </div>

      <!-- Sección de la tabla de clientes -->
      <section>
        <EncabezadoSeccionVue titulo="Clientes" icono="clientes" />

        <TablaVue :columnas="columnasClientes">
          <tr 
            v-for="cliente in clientes" 
            :key="cliente.id"
            class="fila-clicable"
            @click="$router.push(`/detalle-cliente-vista/${cliente.id}`)"
          >
            <td class="panel__texto-nombre">{{ cliente.nombre }}</td>
            <td class="panel__texto-fuerte">{{ cliente.usuario }}</td>
            <td class="panel__texto-fuerte">{{ cliente.celular }}</td>
            <td>
              <ChipEstadoVue
                :estado="cliente.estado === 'activo' ? 'entregado' : 'en_preparacion'"
                :etiqueta="cliente.estado === 'activo' ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="tabla__celda--centro">
              <div class="panel__acciones-fila">
                <!-- .stop evita que el click en el botón active el click de la fila -->
                <button 
                  type="button" 
                  class="btn-accion btn-accion--seguridad" 
                  aria-label="Seguridad cliente"
                  @click.stop
                >
                  <IconoVue nombre="candado" :tamano="16" />
                </button>
                <button 
                  type="button" 
                  class="btn-accion btn-accion--editar" 
                  aria-label="Editar cliente"
                  @click.stop
                >
                  <IconoVue nombre="lapiz" :tamano="16" />
                </button>
                <button 
                  type="button" 
                  class="btn-accion btn-accion--eliminar" 
                  aria-label="Eliminar cliente"
                  @click.stop
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

  <!-- Modal para registrar nuevo cliente -->
  <ModalNuevoCliente
    :mostrar="mostrarModal"
    @cerrar="mostrarModal = false"
    @guardar="registrarNuevoCliente"
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

.btn-accion--seguridad,
.btn-accion--editar {
  background: var(--gf-borde);
  color: var(--gf-texto-tenue);
}

.btn-accion--seguridad:hover,
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