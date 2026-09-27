<script setup lang="ts">
import BotonVue from '@/componentes/BotonVue.vue'
import EncabezadoSeccionVue from '@/componentes/EncabezadoSeccionVue.vue'
import IconoVue from '@/componentes/IconoVue.vue'
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import TablaVue, { type ColumnaTabla } from '@/componentes/TablaVue.vue'
import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'
import type { ItemNavegacion } from '@/componentes/BarraLateralVue.vue'

// Elementos del menú lateral
const itemsNavegacion: ItemNavegacion[] = [
  { etiqueta: 'Inicio', icono: 'inicio' },
  { etiqueta: 'Pedidos', icono: 'pedidos' },
  { etiqueta: 'Clientes', icono: 'clientes' },
  { etiqueta: 'Reportes', icono: 'reportes' },
  { etiqueta: 'Usuarios', icono: 'usuario' },
]

// Definición de las columnas de la tabla según tu diseño en Figma
const columnasUsuarios: ColumnaTabla[] = [
  { clave: 'tipo', etiqueta: 'TIPO' },
  { clave: 'nombre', etiqueta: 'NOMBRE' },
  { clave: 'usuario', etiqueta: 'USUARIO' },
  { clave: 'celular', etiqueta: 'CELULAR' },
  { clave: 'contrasena', etiqueta: 'CONTRASEÑA' },
  { clave: 'estado', etiqueta: 'ESTADO' },
  { clave: 'cambios', etiqueta: 'CAMBIOS', alineacion: 'centro' },
]

// Definición de tipos para los usuarios
interface Usuario {
  id: number
  tipo: string
  nombre: string
  usuario: string
  celular: string
  contrasena: string
  estado: 'activo' | 'inactivo'
}

// Datos simulados idénticos a tu pantalla de Figma
const usuarios: Usuario[] = [
  {
    id: 1,
    tipo: 'ADMIN',
    nombre: 'Roberto Valenzuela Arce',
    usuario: 'OBB123',
    celular: '6670000000',
    contrasena: 'XXXXXXXXXX',
    estado: 'activo',
  },
  {
    id: 2,
    tipo: 'EMPLEADO',
    nombre: 'Cesar Enrique Verdugo Varela',
    usuario: 'CERQ123',
    celular: '6670000000',
    contrasena: 'XXXXXXXXXX',
    estado: 'inactivo',
  },
  {
    id: 3,
    tipo: 'REPORTE',
    nombre: 'Dianne Parroquin Diaz',
    usuario: 'DIAN123',
    celular: '6670000000',
    contrasena: 'XXXXXXXXXX',
    estado: 'activo',
  },
]
</script>

<template>
  <LayoutPanelVue
    titulo="Sistema de Venta a Menudeo"
    usuario="Administrador"
    :items-navegacion="itemsNavegacion"
    item-activo="Usuarios"
  >
    <div class="panel">
      <!-- Encabezado superior de la pantalla -->
      <div class="panel__bienvenida">
        <div>
          <h1 class="panel__titulo">USUARIOS</h1>
          <p class="panel__subtitulo">
            Monitorea, modifica, elimina y crea las cuentas ingresadas.
          </p>
        </div>

        <div class="panel__accion">
          <BotonVue variante="exito">
            <IconoVue nombre="mas" :tamano="16" />
            Nuevo Usuario
          </BotonVue>
        </div>
      </div>

      <!-- Sección de la tabla de usuarios -->
      <section>
        <EncabezadoSeccionVue titulo="Usuarios" icono="usuario" />

        <TablaVue :columnas="columnasUsuarios">
          <tr v-for="usr in usuarios" :key="usr.id">
            <td class="panel__texto-fuerte">{{ usr.tipo }}</td>
            <td class="panel__texto-nombre">{{ usr.nombre }}</td>
            <td class="panel__texto-fuerte">{{ usr.usuario }}</td>
            <td class="panel__texto-fuerte">{{ usr.celular }}</td>
            <td class="panel__texto-fuerte">{{ usr.contrasena }}</td>
            <td>
              <ChipEstadoVue
                :estado="usr.estado === 'activo' ? 'entregado' : 'en_preparacion'"
                :etiqueta="usr.estado === 'activo' ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="tabla__celda--centro">
              <div class="panel__acciones-fila">
                <button type="button" class="btn-accion btn-accion--editar" aria-label="Editar usuario">
                  <IconoVue nombre="lapiz" :tamano="16" />
                </button>
                <button type="button" class="btn-accion btn-accion--eliminar" aria-label="Eliminar usuario">
                  <IconoVue nombre="basura" :tamano="16" />
                </button>
              </div>
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

.panel__acciones-fila {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Botones de acción (Editar / Eliminar) */
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