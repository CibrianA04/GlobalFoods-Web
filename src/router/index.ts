import { createRouter, createWebHistory } from 'vue-router'

import LoginVue from '@/modulos/auth/vistas/LoginVue.vue'
import PanelVue from '@/modulos/principal/vistas/PanelVue.vue'

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
  ],
})

export default router
