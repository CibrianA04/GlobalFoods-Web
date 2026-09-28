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

### IconoVue.vue
Componente para renderizar iconos SVG con tamaño y color controlados por el texto actual o por clases CSS.

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
Encabezado de sección con icono y título para diferenciar bloques en una vista.

### TablaVue.vue
Componente de tablas reutilizable para listar registros, soportando columnas, alineación de contenido y estructura completamente declarativa.

### TarjetaProductoVue.vue
Tarjeta visual para productos o inventario con imagen, nombre, precio, stock y estado de disponibilidad.

### BarraLateralVue.vue y LayoutPanelVue.vue
Son los componentes base para la navegación principal del sistema administrativo. Se recomienda usarlos en cualquier vista del panel para no romper la consistencia visual.

## Recomendaciones

- Preferir reutilizar componentes existentes antes de implementar una versión nueva.
- Mantener los nombres y props entendibles para facilitar la integración de nuevos módulos.
- Cuando un componente requiera lógica más avanzada, mover la funcionalidad a un controlador o servicio específico del módulo.
- Mantener los estilos localizados con `scoped` para evitar conflictos entre vistas.

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

