import { createRouter, createWebHistory } from 'vue-router'

import LoginVue from '@/modulos/auth/vistas/LoginVue.vue'
import PanelVue from '@/modulos/principal/vistas/PanelVue.vue'
import UsuariosVista from '@/modulos/admin/vistas/UsuariosVista.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginVue,
    },
    {
      path: '/panel',
      name: 'panel',
      component: PanelVue,
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosVista
    }
  ],
})

export default router
