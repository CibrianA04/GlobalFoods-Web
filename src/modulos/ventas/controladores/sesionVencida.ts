import type { Router } from 'vue-router'

import { cerrarSesion } from '@/modulos/autenticacion/servicios/servicioAutenticacion'

/**
 * La API rechazó el token (401): cierra la sesión y lleva a inicio de sesión, que con
 * `?sesion=expirada` muestra "Su sesión expiró. Inicie sesión nuevamente."
 */
export function salirPorSesionVencida(enrutador: Router) {
  cerrarSesion()
  return enrutador.push({ name: 'inicio-sesion', query: { sesion: 'expirada' } })
}
