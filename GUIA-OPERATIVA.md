# Guía operativa de Global Foods México

## 1. Propósito

Este documento sirve como guía operativa para iniciar, mantener y diagnosticar la interfaz de Global Foods México. Está pensado para el equipo de desarrollo, pruebas y soporte en entornos locales o de integración.

## 2. Alcance

El proyecto es una interfaz web desarrollada con Vue 3, Vite y TypeScript. La aplicación contiene módulos de usuarios, ventas, inventario, reparto y administración.

## 3. Requisitos del entorno

Antes de trabajar en el proyecto, asegúrate de contar con lo siguiente:

- Node.js 20 o superior
- npm 10 o superior
- Git, para control de versiones
- Editor de código con soporte para Vue/TypeScript, preferiblemente VS Code

## 4. Instalación

Desde la raíz del proyecto ejecuta:

```bash
npm install
```

Si el entorno no tiene dependencias instaladas, el comando anterior las prepara automáticamente.

## 5. Arranque en desarrollo

```bash
npm run dev
```

La aplicación queda disponible en:

- http://localhost:5173

Si el puerto está ocupado, Vite puede reasignar el puerto automáticamente o puedes ajustar la configuración en `vite.config.ts`.

## 6. Compilación y validación

Para compilar el proyecto:

```bash
npm run build
```

Para previsualizar la versión construida:

```bash
npm run preview
```

## 7. Estructura del proyecto

```text
src/
├─ inicio.ts
├─ aplicacion/
│  ├─ Aplicacion.vue
│  └─ enrutador.ts
├─ recursos/
├─ componentes/
├─ estilos/
├─ modulos/
│  ├─ autenticacion/
│  ├─ principal/
│  ├─ administracion/
│  ├─ ventas/
│  ├─ almacen/
│  └─ reparto/
└─ pruebas/
```

### Descripción por capa

- `src/aplicacion/Aplicacion.vue`: raíz de la aplicación
- `src/inicio.ts`: punto de entrada de Vue
- `src/aplicacion/enrutador.ts`: configuración de las rutas
- `src/componentes`: elementos reutilizables en toda la interfaz
- `src/modulos`: módulos funcionales del sistema
- `src/estilos/tokens.css`: tokens visuales y paleta de colores

## 8. Módulos del sistema

### Autenticación

Contiene la pantalla de inicio de sesión.

- Ruta: `/inicio-sesion`
- Vista: `src/modulos/autenticacion/vistas/InicioSesionVista.vue`
- Servicio: `src/modulos/autenticacion/servicios/servicioAutenticacion.ts`
- La dirección de la API se configura con `VITE_API_URL`; por defecto es `http://localhost:3000`.

### Principal

Incluye la vista general del sistema a partir del panel central.

- Ruta: `/panel`
- Recurso principal: `src/modulos/principal/vistas/PanelVue.vue`

### Administración

Se encarga del módulo de administración y usuarios.

- Ruta: `/usuarios`
- Vista: `src/modulos/administracion/vistas/UsuariosVista.vue`

### Ventas

Contiene la pantalla **Nuevo pedido**: el asesor busca un cliente registrado, agrega productos del inventario, captura los datos de entrega, confirma el resumen y registra el pedido. El pedido queda en estado Pendiente con un folio.

- Ruta: `/pedidos/nuevo` (nombre `nuevo-pedido`, requiere sesión). Se abre con el botón "Nuevo Pedido" del panel.
- Vista: `src/modulos/ventas/vistas/NuevoPedidoVista.vue`
- Componentes: `src/modulos/ventas/componentes/` (secciones Cliente, Productos y Entrega, resumen lateral y modales Agregar producto, Confirmar pedido y Descartar pedido)
- Estado y validaciones: `src/modulos/ventas/controladores/usarNuevoPedido.ts` (formulario) y `usarBuscadorClientes.ts` (búsqueda de clientes)
- Tipos: `src/modulos/ventas/interfaces/cliente.ts` y `pedido.ts`
- Servicios:
  - Productos: reales, de `GET /api/inventario/actual` (`src/modulos/almacen/servicios/servicioInventario.ts`).
  - Clientes: **simulado** en `servicioClientes.ts`. Endpoint propuesto `GET /api/clientes?busqueda=`, todavía no existe.
  - Registro: **simulado** en `servicioPedidos.ts`. Endpoint propuesto `POST /api/pedidos`, todavía no existe. Devuelve folios consecutivos desde `#12348`.

Para probar los mensajes de error sin API, cambia a `true` las constantes `FORZAR_ERROR_BUSQUEDA` (en `servicioClientes.ts`) o `FORZAR_ERROR_REGISTRO` (en `servicioPedidos.ts`). Regrésalas a `false` antes de subir cambios. Si la API no está corriendo, la sección Productos muestra "No es posible confirmar la disponibilidad en este momento." y no deja agregar productos.

Si hay datos capturados, salir de la pantalla por el menú lateral, el botón atrás del navegador o "Cancelar" pide confirmar que se descartan. Recargar la página o cerrar la pestaña no pide confirmación.

### Almacén y reparto

Están diseñados para alojar las pantallas de cada área del negocio. Actualmente el proyecto ya define la estructura base y los módulos visuales principales, y está listo para ampliarse con lógica real de negocio.

## 9. Rutas actuales

El enrutador usa historial HTML5 configurado con Vue Router:

- `/` → redirige a `/inicio-sesion`
- `/inicio-sesion`
- `/panel`
- `/usuarios`
- `/pedidos/nuevo`

## 10. Convenciones de desarrollo

### Nomenclatura

- Los archivos de componentes terminan con `Vue` para mantener consistencia.
- Las vistas se ubican dentro de `vistas/` en cada módulo.
- Los aliases de importación usan `@` apuntando a `src`.

### Estilos

- La hoja de estilos principal debe mantenerse en `src/estilos/tokens.css`.
- Preferir `scoped` para estilos específicos de componentes.
- Reutilizar componentes existentes de `src/componentes` antes de crear nuevos.

### TypeScript

- Mantén los tipos en interfaces y modelos del dominio.
- Evita valores duros cuando ya exista un componente o constante reutilizable.

## 11. Flujo de trabajo recomendado

1. Abrir el proyecto en VS Code.
2. Ejecutar `npm install` si es la primera vez.
3. Lanzar `npm run dev`.
4. Trabajar dentro del módulo correspondiente.
5. Reutilizar UI y componentes compartidos.
6. Ejecutar `npm run build` antes de cerrar tareas o entregar cambios.

## 12. Diagnóstico y resolución de problemas

### Error: dependencias no instaladas

```bash
npm install
```

### Error: Vite no inicia

Verifica:

- que Node.js esté instalado correctamente
- que el puerto 5173 no esté ocupado
- que no haya errores en la configuración de Vite

### Error de compilación TypeScript

Ejecuta:

```bash
npm run build
```

Revisa los mensajes de Vue y TypeScript. En la mayoría de los casos se debe a:

- imports incorrectos
- tipos sin definir
- rutas de alias mal configuradas
- archivos de componentes con errores de sintaxis

### Componentes no se renderizan

Verifica:

- que la ruta esté registrada en `src/aplicacion/enrutador.ts`
- que el componente exista en la ruta importada
- que el alias `@` esté correctamente resuelto por Vite

## 13. Buenas prácticas para mantenimiento

- Mantener la documentación actualizada después de cada cambio importante.
- Documentar nuevas rutas, módulos y props de componentes.
- Respetar el sistema de tokens visuales del proyecto.
- Priorizar consistencia de UI sobre soluciones aisladas.
- Hacer pruebas manuales de navegación y pantallas principales antes de cerrar una tarea.

## 14. Recomendaciones de mejora

A futuro, se recomienda:

- integrar un backend real con servicios API y manejo de errores
- añadir autenticación con tokens o sesiones
- crear una capa de servicios para cada módulo
- agregar pruebas unitarias y de integración
- definir estándares de estado y carga para cada módulo

## 15. Contacto / responsables

El proyecto es desarrollado por el equipo de Global Foods México del curso académico actual. Para cambios de arquitectura, revisión de UI o coordinación de entregas, se recomienda comunicar los cambios dentro del equipo en la misma rama o issue de trabajo.

## 16. Resumen rápido

Comandos clave:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Si algo falla, revisa primero:

- dependencias
- rutas
- configuración de Vite
- compilación con TypeScript
- estado de la ejecución local
