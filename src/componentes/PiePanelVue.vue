<script setup lang="ts">
// Pie del panel: copyright y enlaces legales, iguales en todas las pantallas.

const anio = new Date().getFullYear()
</script>

<template>
  <footer class="pie">
    <p class="pie__copyright">Global Foods México © {{ anio }}</p>

    <div class="pie__enlaces">
      <!-- TODO: enlazar cuando existan las pantallas legales. -->
      <button type="button" class="pie__enlace">Términos y Condiciones</button>
      <button type="button" class="pie__enlace">Política de Privacidad</button>
    </div>
  </footer>
</template>

<style scoped>
.pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 18px 28px;
  background: var(--gf-primario);
  color: color-mix(in srgb, var(--gf-superficie) 75%, transparent);
  font-size: 11px;
}

.pie__copyright {
  margin: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pie__enlaces {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.pie__enlace {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.pie__enlace:hover {
  color: var(--gf-superficie);
  text-decoration: underline;
}

.pie__enlace:focus-visible {
  outline: 2px solid var(--gf-claro);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 900px) {
  .pie {
    padding: 16px;
  }
}
</style>
