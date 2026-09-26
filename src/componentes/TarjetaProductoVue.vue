<script setup lang="ts">
// Tarjeta de producto del inventario.

import ChipEstadoVue from '@/componentes/ChipEstadoVue.vue'

interface Props {
  nombre: string
  /** URL de la imagen del producto. */
  imagen: string
  /** Stock ya formateado con su unidad, p. ej. "45 kg". */
  stock: string
  /** Precio ya formateado, p. ej. "$280/kg". */
  precio: string
  disponible: boolean
}

defineProps<Props>()
</script>

<template>
  <article class="tarjeta">
    <div class="tarjeta__foto">
      <img :src="imagen" alt="" class="tarjeta__imagen" />
    </div>

    <div class="tarjeta__cuerpo">
      <h3 class="tarjeta__nombre">{{ nombre }}</h3>

      <dl class="tarjeta__datos">
        <div>
          <dt class="tarjeta__dato-etiqueta">Stock</dt>
          <dd class="tarjeta__dato-valor">{{ stock }}</dd>
        </div>
        <div class="tarjeta__dato--derecha">
          <dt class="tarjeta__dato-etiqueta">Precio</dt>
          <dd class="tarjeta__dato-valor tarjeta__dato-valor--fuerte">{{ precio }}</dd>
        </div>
      </dl>

      <div class="tarjeta__pie">
        <ChipEstadoVue
          :estado="disponible ? 'entregado' : 'cancelado'"
          :etiqueta="disponible ? 'En stock' : 'Agotado'"
        />
        <slot name="accion" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.tarjeta {
  overflow: hidden;
  border: 1px solid var(--gf-borde);
  border-radius: var(--gf-radio);
  background: var(--gf-superficie);
}

/* La foto va absoluta para que su proporción no empuje el alto de la caja. */
.tarjeta__foto {
  position: relative;
  aspect-ratio: 16 / 6;
  overflow: hidden;
  background: var(--gf-fondo);
}

.tarjeta__imagen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarjeta__cuerpo {
  padding: 14px 14px 12px;
}

.tarjeta__nombre {
  margin: 0 0 12px;
  color: var(--gf-texto);
  font-size: 15px;
  font-weight: 700;
}

.tarjeta__datos {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 12px;
}

.tarjeta__dato--derecha {
  text-align: right;
}

.tarjeta__dato-etiqueta {
  color: var(--gf-texto-tenue);
  font-size: 11px;
}

.tarjeta__dato-valor {
  margin: 2px 0 0;
  color: var(--gf-texto);
  font-size: 14px;
}

.tarjeta__dato-valor--fuerte {
  color: var(--gf-primario);
  font-weight: 700;
}

.tarjeta__pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
}
</style>
