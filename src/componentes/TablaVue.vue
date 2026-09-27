<script lang="ts">
export interface ColumnaTabla {
  /** Identificador único de la columna. */
  clave: string
  /** Texto del encabezado. */
  etiqueta: string
  alineacion?: 'izquierda' | 'centro' | 'derecha'
}

export interface Props {
  columnas: ColumnaTabla[]
  /** Alto máximo en píxeles; al excederlo la tabla se desplaza por dentro. Sin él, crece con su contenido. */
  altoMaximo?: number
}
</script>

<script setup lang="ts">
// Tabla con encabezado fijo y scroll propio en ambos ejes.
// Cada pantalla pinta sus filas (<tr> con sus <td>) en el slot por defecto.

defineProps<Props>()
</script>

<template>
  <div class="tabla" :style="altoMaximo ? { maxHeight: `${altoMaximo}px` } : undefined">
    <table class="tabla__tabla">
      <thead>
        <tr>
          <th
            v-for="columna in columnas"
            :key="columna.clave"
            scope="col"
            :class="`tabla__celda--${columna.alineacion ?? 'izquierda'}`"
          >
            {{ columna.etiqueta }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Se desplaza dentro de su caja, no la página entera. */
.tabla {
  overflow: auto;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
}

/* separate en vez de collapse: con collapse el borde del encabezado fijo no lo acompaña al desplazar. */
.tabla__tabla {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: var(--gf-texto);
  font-size: 14px;
}

/* Fondo sólido para que las filas no se vean a través del encabezado fijo. */
.tabla__tabla th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 16px;
  border-bottom: 1px solid var(--gf-borde);
  background: var(--gf-fondo);
  color: var(--gf-texto-tenue);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Sin saltos de línea: en pantallas angostas aparece el scroll horizontal propio. */
.tabla__tabla :slotted(td) {
  padding: 8px 16px;
  border-bottom: 1px solid var(--gf-borde);
  vertical-align: middle;
  white-space: nowrap;
}

.tabla__tabla :slotted(tr:last-child > td) {
  border-bottom: 0;
}

.tabla__tabla .tabla__celda--centro,
.tabla__tabla :slotted(.tabla__celda--centro) {
  text-align: center;
}

.tabla__tabla .tabla__celda--derecha,
.tabla__tabla :slotted(.tabla__celda--derecha) {
  text-align: right;
}
</style>
