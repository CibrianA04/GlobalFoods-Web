import { formatearFecha } from '@/modulos/ventas/controladores/formatosPedido'
import type { DatosRegistroPedido, ModalidadEntrega } from '@/modulos/ventas/interfaces/pedido'

// La API no tiene campos para modalidad, fecha de entrega ni referencias, así que Nuevo pedido
// los guarda al inicio de Observaciones, seguidos de lo que capturó la asesora:
//   "A domicilio · Entrega 28/10/2026 · Ref: portón negro · Llamar antes de llegar"
//   "Recolección en congeladora · Entrega 28/10/2026"
// armarObservaciones() escribe ese formato y leerObservaciones() lo lee; si cambia, se cambia aquí.
// La lectura también reconoce "Dir: {dirección}" (a domicilio, antes de las notas), aunque hoy
// Nuevo pedido no lo escribe.

const SEPARADOR = ' · '
const PREFIJO_DIRECCION = 'Dir: '
const PREFIJO_REFERENCIAS = 'Ref: '
const FECHA_ENTREGA = /^Entrega (\d{2})\/(\d{2})\/(\d{4})$/

const MODALIDAD_EN_TEXTO: Record<ModalidadEntrega, string> = {
  domicilio: 'A domicilio',
  recoleccion: 'Recolección en congeladora',
}

/** Datos de entrega que un pedido guarda en Observaciones. */
export interface ObservacionesPedido {
  modalidad: ModalidadEntrega | null
  /** aaaa-mm-dd */
  fechaEntrega: string | null
  /** Solo si el texto trae "Dir: …"; si no, null. */
  direccion: string | null
  referencias: string | null
  /** Lo que capturó la asesora; si el texto no trae el formato, el texto completo. */
  notas: string | null
}

export function armarObservaciones(
  datos: Pick<DatosRegistroPedido, 'modalidad' | 'fechaEntrega' | 'referencias' | 'observaciones'>,
): string {
  const partes = [MODALIDAD_EN_TEXTO[datos.modalidad], `Entrega ${formatearFecha(datos.fechaEntrega)}`]
  if (datos.modalidad === 'domicilio' && datos.referencias) partes.push(`${PREFIJO_REFERENCIAS}${datos.referencias}`)
  if (datos.observaciones) partes.push(datos.observaciones)
  return partes.join(SEPARADOR)
}

/**
 * Separa los datos de entrega de las notas. Si el texto no empieza con modalidad y fecha (p. ej.
 * un pedido capturado en el sistema interno), regresa todo null y el texto completo como notas.
 * Si unas referencias traen " · ", lo que sigue de ellas se lee como notas.
 */
export function leerObservaciones(texto: string | null): ObservacionesPedido {
  const completo = texto?.trim() ?? ''
  const [primera = '', segunda = '', ...resto] = completo.split(SEPARADOR)
  const modalidad = (Object.keys(MODALIDAD_EN_TEXTO) as ModalidadEntrega[]).find(
    (clave) => MODALIDAD_EN_TEXTO[clave] === primera,
  )
  const fecha = FECHA_ENTREGA.exec(segunda)

  if (!modalidad || !fecha) {
    return { modalidad: null, fechaEntrega: null, direccion: null, referencias: null, notas: completo || null }
  }

  // Dirección y referencias solo van a domicilio, en cualquier orden, antes de las notas.
  let direccion: string | null = null
  let referencias: string | null = null
  while (modalidad === 'domicilio' && resto.length > 0) {
    const parte = resto[0] ?? ''
    if (direccion === null && parte.startsWith(PREFIJO_DIRECCION)) {
      direccion = parte.slice(PREFIJO_DIRECCION.length).trim()
    } else if (referencias === null && parte.startsWith(PREFIJO_REFERENCIAS)) {
      referencias = parte.slice(PREFIJO_REFERENCIAS.length).trim()
    } else {
      break
    }
    resto.shift()
  }

  const [, dia, mes, anio] = fecha
  return {
    modalidad,
    fechaEntrega: `${anio}-${mes}-${dia}`,
    direccion: direccion || null,
    referencias: referencias || null,
    notas: resto.join(SEPARADOR).trim() || null,
  }
}
