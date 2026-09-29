import type { NombreIcono } from '@/componentes/IconoVue.vue'
import type { ModalidadEntrega } from '@/modulos/ventas/interfaces/pedido'

const formatoMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const formatoNumero = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

/** 2930 → "$2,930.00" */
export function formatearMoneda(importe: number): string {
  return formatoMoneda.format(importe)
}

/** 12.5 → "12.5" (sin unidad; máximo 2 decimales). */
export function formatearNumero(valor: number): string {
  return formatoNumero.format(valor)
}

/** 12.5 → "12.5 kg" */
export function formatearKg(kg: number): string {
  return `${formatoNumero.format(kg)} kg`
}

/** "2026-09-30" → "30/09/2026". Vacío → vacío. */
export function formatearFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-')
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : ''
}

/** Fecha de hoy en la zona horaria del equipo, como aaaa-mm-dd (el formato de <input type="date">). */
export function fechaHoyIso(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/** (3, 10) → "3 productos · 10 kg" */
export function textoProductosKg(numeroProductos: number, totalKg: number): string {
  const productos = numeroProductos === 1 ? 'producto' : 'productos'
  return `${numeroProductos} ${productos} · ${formatearKg(totalKg)}`
}

// Palabras que no cuentan para las iniciales ("Mariscos El Faro" → "MF").
const PALABRAS_SIN_INICIAL = new Set(['y', 'e', 'de', 'del', 'la', 'las', 'el', 'los'])

/** Iniciales del cliente: primeras letras de las dos primeras palabras significativas. */
export function inicialesCliente(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter((palabra) => palabra && !PALABRAS_SIN_INICIAL.has(palabra.toLowerCase()))
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toUpperCase()
}

export const MODALIDADES: Record<ModalidadEntrega, { titulo: string; descripcion: string; icono: NombreIcono }> = {
  domicilio: {
    titulo: 'Entrega a domicilio',
    descripcion: 'El repartidor lleva el pedido a la dirección del cliente.',
    icono: 'camion',
  },
  recoleccion: {
    titulo: 'Recolección en congeladora',
    descripcion: 'El cliente recoge su pedido directamente en la congeladora.',
    icono: 'congeladora',
  },
}
