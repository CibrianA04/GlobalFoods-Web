import { createRouter, createWebHistory } from 'vue-router'

import InicioSesionVista from '@/modulos/autenticacion/vistas/InicioSesionVista.vue'
import PanelVue from '@/modulos/principal/vistas/PanelVue.vue'
import UsuariosVista from '@/modulos/administracion/vistas/UsuariosVista.vue'
import { haySesion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'
import ClientesVista from '@/modulos/administracion/vistas/ClientesVista.vue'
import DetalleClienteVista from '@/modulos/administracion/vistas/DetalleClienteVista.vue'

const enrutador = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/inicio-sesion',
    },
    {
      path: '/inicio-sesion',
      name: 'inicio-sesion',
      component: InicioSesionVista,
    },
    {
      path: '/panel',
      name: 'panel',
      component: PanelVue,
      meta: { requiereAutenticacion: true },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosVista,
      meta: { requiereAutenticacion: true },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesVista
    },
    {
      path: '/detalle-cliente-vista/:id',
      name: 'detalle-cliente',
      component: DetalleClienteVista
    }
  ],
})

enrutador.beforeEach((destino) => {
  const requiereAutenticacion = destino.matched.some((registro) => registro.meta.requiereAutenticacion)

  if (requiereAutenticacion && !haySesion()) {
    return '/inicio-sesion'
  }

  if (destino.path === '/inicio-sesion' && haySesion()) {
    return '/panel'
  }
})

export default enrutador
