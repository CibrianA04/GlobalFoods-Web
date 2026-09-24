import { createRouter, createWebHistory } from 'vue-router'

import LoginVue from '@/modulos/auth/vistas/LoginVue.vue'

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
  ],
})

export default router
