import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { Cliente } from '@/modulos/ventas/interfaces/cliente'
import { buscarClientes } from '@/modulos/ventas/servicios/servicioClientes'

export const MINIMO_CARACTERES_BUSQUEDA = 3
const ESPERA_ANTES_DE_BUSCAR_MS = 300

export const MENSAJES_BUSQUEDA = {
  faltanCaracteres: 'Capture al menos 3 caracteres para buscar.',
  sinResultados:
    'No se encontraron clientes con ese criterio. Si es un cliente nuevo, solicite su alta en el sistema interno.',
  buscando: 'Buscando clientes…',
}

/**
 * Estado del buscador de clientes: busca mientras se escribe (con espera de 300 ms y a partir
 * de 3 caracteres), guarda los resultados y la opción activa de la lista para el teclado.
 * Si la consulta falla, llama a `alFallar` para que la vista muestre el aviso.
 */
export function usarBuscadorClientes(opciones: { alFallar: () => void }) {
  const criterio = ref('')
  const resultados = ref<Cliente[]>([])
  const buscando = ref(false)
  /** Hay una respuesta para el criterio actual (aunque venga vacía). */
  const hayRespuesta = ref(false)
  const listaAbierta = ref(false)
  /** Opción resaltada con las flechas; -1 si ninguna. */
  const indiceActivo = ref(-1)

  let temporizador: ReturnType<typeof setTimeout> | undefined
  // Cada consulta lleva un número; si llega la respuesta de una vieja, se descarta.
  let consultaVigente = 0

  const criterioLimpio = computed(() => criterio.value.trim())

  const mensajeAyuda = computed(() => {
    const longitud = criterioLimpio.value.length
    if (longitud > 0 && longitud < MINIMO_CARACTERES_BUSQUEDA) return MENSAJES_BUSQUEDA.faltanCaracteres
    if (buscando.value && resultados.value.length === 0) return MENSAJES_BUSQUEDA.buscando
    if (hayRespuesta.value && resultados.value.length === 0) return MENSAJES_BUSQUEDA.sinResultados
    return ''
  })

  watch(criterioLimpio, (texto) => {
    clearTimeout(temporizador)
    consultaVigente += 1
    hayRespuesta.value = false
    indiceActivo.value = -1

    if (texto.length < MINIMO_CARACTERES_BUSQUEDA) {
      buscando.value = false
      resultados.value = []
      listaAbierta.value = false
      return
    }

    // Los resultados anteriores se quedan a la vista hasta que llegan los nuevos.
    buscando.value = true
    temporizador = setTimeout(() => consultar(texto), ESPERA_ANTES_DE_BUSCAR_MS)
  })

  async function consultar(texto: string) {
    const numero = consultaVigente
    try {
      const lista = await buscarClientes(texto)
      if (numero !== consultaVigente) return
      resultados.value = lista
      hayRespuesta.value = true
      indiceActivo.value = -1
      listaAbierta.value = lista.length > 0
    } catch {
      if (numero !== consultaVigente) return
      resultados.value = []
      listaAbierta.value = false
      opciones.alFallar()
    } finally {
      if (numero === consultaVigente) buscando.value = false
    }
  }

  function abrirLista() {
    if (resultados.value.length > 0) listaAbierta.value = true
  }

  function cerrarLista() {
    listaAbierta.value = false
    indiceActivo.value = -1
  }

  /** Mueve la opción activa (con vuelta al inicio o al final). Abre la lista si estaba cerrada. */
  function moverActivo(paso: 1 | -1) {
    const total = resultados.value.length
    if (total === 0) return
    listaAbierta.value = true
    if (indiceActivo.value === -1) {
      indiceActivo.value = paso === 1 ? 0 : total - 1
      return
    }
    indiceActivo.value = (indiceActivo.value + paso + total) % total
  }

  function limpiar() {
    clearTimeout(temporizador)
    consultaVigente += 1
    criterio.value = ''
    resultados.value = []
    buscando.value = false
    hayRespuesta.value = false
    cerrarLista()
  }

  onBeforeUnmount(() => {
    clearTimeout(temporizador)
    consultaVigente += 1
  })

  return {
    criterio,
    resultados,
    buscando,
    listaAbierta,
    indiceActivo,
    mensajeAyuda,
    abrirLista,
    cerrarLista,
    moverActivo,
    limpiar,
  }
}
