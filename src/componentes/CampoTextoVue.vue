<script setup lang="ts">
// Campo de texto reutilizable.
// No sabe nada de ninguna pantalla en concreto: todo lo particular
// (textos, enlaces, atributos extra) entra por props, por $attrs o por el slot.

type IconoCampo = 'usuario' | 'candado'

type TipoCampo = 'text' | 'password' | 'email' | 'tel' | 'number' | 'search' | 'date'

interface Props {
  /** Identificador del <input>. Enlaza la <label> y el mensaje de error. */
  id: string
  /** Texto visible de la etiqueta. */
  etiqueta: string
  /** Tipo nativo del input. */
  tipo?: TipoCampo
  /** Texto del placeholder. */
  marcador?: string
  /** Icono opcional dibujado dentro del campo, a la izquierda del texto. */
  icono?: IconoCampo
  deshabilitado?: boolean
  /** Mensaje de error. Si trae texto, se pinta debajo del campo. */
  error?: string
}

withDefaults(defineProps<Props>(), {
  tipo: 'text',
  marcador: '',
  icono: undefined,
  deshabilitado: false,
  error: '',
})

// Los atributos que no son props (autocomplete, maxlength, inputmode...)
// se aplican al <input>, no al contenedor.
defineOptions({ inheritAttrs: false })

const valor = defineModel<string>({ default: '' })
</script>

<template>
  <div class="campo" :class="{ 'campo--con-error': !!error }">
    <div class="campo__cabecera">
      <label class="campo__etiqueta" :for="id">{{ etiqueta }}</label>
      <!-- Hueco a la derecha de la etiqueta para un enlace o una acción. -->
      <slot name="accion" />
    </div>

    <div class="campo__caja">
      <span v-if="icono" class="campo__icono">
        <svg
          v-if="icono === 'usuario'"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v1.5c0 .28.22.5.5.5h15c.28 0 .5-.22.5-.5V18c0-2.66-5.33-4-8-4Z"
          />
        </svg>

        <svg
          v-else
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm2 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
          />
        </svg>
      </span>

      <input
        :id="id"
        v-model="valor"
        class="campo__entrada"
        :type="tipo"
        :placeholder="marcador"
        :disabled="deshabilitado"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? id + '-error' : undefined"
        v-bind="$attrs"
      />
    </div>

    <p v-if="error" :id="id + '-error'" class="campo__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.campo {
  /* Gris del relleno del campo. Todavía no existe un token de marca para
     este tono, así que queda como variable local y se puede sobrescribir
     desde fuera con `--campo-fondo`. */
  --campo-fondo: #f1f4f7;

  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.campo__cabecera {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.campo__etiqueta {
  font-size: 13px;
  font-weight: 500;
  color: var(--gf-texto);
}

.campo__caja {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  background: var(--campo-fondo);
  border: 1px solid var(--gf-borde);
  border-radius: 8px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.campo__caja:focus-within {
  border-color: var(--gf-secundario);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-secundario) 22%, transparent);
}

.campo__caja:has(.campo__entrada:disabled) {
  opacity: 0.6;
}

.campo--con-error .campo__caja {
  border-color: var(--gf-cancelado-punto);
}

.campo--con-error .campo__caja:focus-within {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gf-cancelado-punto) 22%, transparent);
}

.campo__icono {
  display: flex;
  flex: none;
  color: var(--gf-secundario);
}

.campo__entrada {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gf-texto);
  font: inherit;
  font-size: 14px;
  outline: none;
}

.campo__entrada::placeholder {
  color: var(--gf-texto-tenue);
  opacity: 0.8;
}

.campo__entrada:disabled {
  cursor: not-allowed;
}

.campo__error {
  margin: 0;
  font-size: 12px;
  color: var(--gf-cancelado-punto);
}
</style>
