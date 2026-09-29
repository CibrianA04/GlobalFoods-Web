# Componentes compartidos

Este catálogo documenta los componentes reutilizables del frontend. La intención es mantener una base visual consistente para las pantallas del panel administrativo de Global Foods México.

## Convención general

- Todos los componentes viven en `src/componentes`.
- Se usan nombres terminados en `Vue` para mantener compatibilidad con la convención del proyecto.
- El estilo principal se apoya en tokens definidos en `src/estilos/tokens.css`.
- Los componentes son reutilizables y se pueden combinar para construir vistas del módulo.

## Lista de componentes

### BotonVue.vue
Botón principal de la marca con variantes visuales para acciones primarias, secundarias y estados de éxito o cancelación.

Uso típico:

```vue
<BotonVue variante="primario">Guardar</BotonVue>
<BotonVue variante="exito">Nuevo Usuario</BotonVue>
```

Props opcionales: `tipo`, `variante` (`primario`, `secundario`, `exito`), `soloIcono`, `deshabilitado`, `cargando` (muestra un girador y bloquea el botón) y `compacto` (alto de 34 px, para acciones dentro de tarjetas, tablas o encabezados de sección). El botón ocupa todo el ancho de su contenedor; para que se ajuste al texto, envuélvelo en un contenedor con `flex: none`.

### CampoTextoVue.vue
Campo de entrada reutilizable con soporte para etiquetas, texto de ejemplo, iconos y tipo de contraseña.

Uso típico:

```vue
<CampoTextoVue
  v-model="usuario"
  etiqueta="Usuario"
  marcador="Escribe tu usuario"
  icono="usuario"
/>
```

Props opcionales:

- `icono`: `usuario`, `candado` o `lupa`.
- `error`: mensaje debajo del campo; agrega `aria-invalid` y lo enlaza con `aria-describedby`.
- `obligatorio`: asterisco rojo en la etiqueta y `aria-required`.
- `compacto`: etiqueta de 14 px y texto de 15 px, para formularios con muchos campos.
- `ayuda`: texto de apoyo debajo del campo, anunciado al cambiar (`aria-live`) y enlazado con `aria-describedby`. Pasa `''` para dejar lista la región aunque todavía no haya texto.

Los atributos que no son props (`autocomplete`, `min`, `readonly`, `role`, `aria-*`, eventos) se aplican al `<input>`, **también `class`**: para dar márgenes o tamaño al campo, envuélvelo en un contenedor.

```vue
<CampoTextoVue
  id="pedido-cliente"
  v-model="criterio"
  etiqueta="Buscar cliente"
  marcador="Nombre, razón social o teléfono"
  icono="lupa"
  obligatorio
  compacto
  :error="errorCliente"
  :ayuda="mensajeBusqueda"
/>
```

### IconoVue.vue
Componente para renderizar iconos SVG con tamaño y color controlados por el texto actual o por clases CSS.

Iconos disponibles: `inicio`, `pedidos`, `clientes`, `reportes`, `usuario`, `caja`, `reloj`, `engrane`, `salir`, `mas`, `menos`, `bolsa`, `lapiz`, `basura`, `candado`, `flecha-izquierda`, `lupa`, `camion`, `check`, `calendario`, `congeladora`, `cerrar` y `alerta`. Todos son de trazo, con `viewBox` de 24 y `currentColor`. Para agregar uno, suma su nombre a `NombreIcono` y su dibujo al template con el mismo estilo.

### ChipEstadoVue.vue
Píldora de estado utilizada para mostrar estados como activo, inactivo, entregado, pendiente o cancelado.

### BarraLateralVue.vue
Menú lateral con navegación por secciones del sistema. Se utiliza dentro de layouts de panel para mantener una experiencia visual consistente.

### EncabezadoPanelVue.vue
Encabezado superior del panel con identidad visual institucional, nombre del módulo y nombre del usuario activo.

### PiePanelVue.vue
Pie de página del panel con información legal y enlaces de navegación secundaria.

### LayoutPanelVue.vue
Contenedor base de la estructura del panel: encabezado, navegación lateral, contenido principal y pie.

### EncabezadoSeccionVue.vue
Encabezado de sección con icono y título para diferenciar bloques en una vista. El slot por defecto pone una acción a la derecha. La prop opcional `paso` dibuja un número en círculo antes del icono, para formularios por pasos.

```vue
<EncabezadoSeccionVue :paso="2" titulo="Productos" icono="caja">
  <BotonVue variante="secundario" compacto>Agregar producto</BotonVue>
</EncabezadoSeccionVue>
```

### TablaVue.vue
Componente de tablas reutilizable para listar registros, soportando columnas, alineación de contenido y estructura completamente declarativa. En una columna, `ocultarEtiqueta: true` oculta el encabezado a la vista pero lo deja para lectores de pantalla (útil en columnas de acciones).

### ModalVue.vue
Diálogo modal base: velo, tarjeta con título y caja con borde (el estilo de `ModalNuevoCliente`). Úsalo para cualquier modal nuevo; ya resuelve la accesibilidad:

- `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título visible.
- Se cierra con Escape, con la X o con clic en el velo (emite `cerrar`; el que lo usa decide).
- El foco no sale del diálogo (Tab y Shift+Tab dan la vuelta) y el resto de la app queda `inert`.
- Foco inicial en el elemento con `data-autofocus` o, si no hay, en el primero enfocable. Al cerrar regresa al elemento que lo abrió, o al id indicado en `enfocarAlCerrar`.
- Si hay varios abiertos, solo el último responde a Escape.

Props: `mostrar`, `titulo`, `anchoMaximo` (px, 480 por defecto), `cerrable` (con `false` no se cierra, p. ej. mientras se envía algo), `botonCerrar` (muestra la X) y `enfocarAlCerrar`. Slots: el por defecto (contenido de la caja) y `pie` (botones).

```vue
<ModalVue :mostrar="mostrarModal" titulo="¿Descartar el pedido?" @cerrar="mostrarModal = false">
  <p>Se perderán los datos capturados.</p>
  <template #pie>
    <BotonVue variante="secundario" data-autofocus @click="mostrarModal = false">Seguir capturando</BotonVue>
    <BotonVue @click="descartar">Descartar pedido</BotonVue>
  </template>
</ModalVue>
```

### AvisoVue.vue
Mensaje emergente (arriba a la derecha) para avisos que no dependen de un campo, como un error al consultar o guardar. El texto va con `v-model`: con texto se muestra y vacío se oculta. Se cierra solo a los 6 s (`duracion` en ms; con `0` solo se cierra con la X), y la cuenta se pausa mientras el puntero o el foco están sobre él. El texto lleva `role="alert"` para que lo anuncien los lectores de pantalla.

Props: `variante` (`error`, `exito` o `info`; `error` por defecto) y `duracion`.

```vue
<script setup lang="ts">
const mensajeAviso = ref('')

async function avisar(texto: string) {
  // Se vacía primero para que un mensaje repetido se vuelva a mostrar y a anunciar.
  mensajeAviso.value = ''
  await nextTick()
  mensajeAviso.value = texto
}
</script>

<template>
  <AvisoVue v-model="mensajeAviso" />
</template>
```

Se coloca una vez por vista, fuera de `LayoutPanelVue` (se teletransporta a `body`).

### TarjetaProductoVue.vue
Tarjeta visual para productos o inventario con imagen, nombre, precio, stock y estado de disponibilidad.

### BarraLateralVue.vue y LayoutPanelVue.vue
Son los componentes base para la navegación principal del sistema administrativo. Se recomienda usarlos en cualquier vista del panel para no romper la consistencia visual.

## Recomendaciones

- Preferir reutilizar componentes existentes antes de implementar una versión nueva.
- Mantener los nombres y props entendibles para facilitar la integración de nuevos módulos.
- Cuando un componente requiera lógica más avanzada, mover la funcionalidad a un controlador o servicio específico del módulo.
- Mantener los estilos localizados con `scoped` para evitar conflictos entre vistas.
- Para texto que solo deben oír los lectores de pantalla, usar la clase global `visualmente-oculto` (definida en `src/estilos/tokens.css`).

## Ejemplo de integración

```vue
<script setup lang="ts">
import LayoutPanelVue from '@/componentes/LayoutPanelVue.vue'
import BotonVue from '@/componentes/BotonVue.vue'
</script>

<template>
  <LayoutPanelVue titulo="Sistema de Venta a Menudeo" usuario="Administrador">
    <BotonVue variante="exito">Agregar</BotonVue>
  </LayoutPanelVue>
</template>
```

