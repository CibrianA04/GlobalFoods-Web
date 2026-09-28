# Global Foods México — Interfaz web

## Descripción general

Este proyecto corresponde al frontend de Global Foods México, desarrollado con Vue 3, Vite y TypeScript. La aplicación está enfocada en una interfaz administrativa para gestión de ventas, usuarios, inventario, logística y operación del negocio.

## Integrantes

- Cibrian Robles José Alonso — 22170613
- Olivarria García Luis Fernando — 22170748
- Ontiveros Ramos Victoria Adahi — 22170749
- Parroquin Diaz Dianne — 22170765
- Valenzuela Arce Roberto — 22170843
- Verdugo Varela Cesar Enrique — 22170850

## Tecnologías

- Vue 3
- Vite
- TypeScript
- Vue Router
- Axios
- CSS nativo con tokens de diseño

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- Git

## Inicio rápido

```bash
npm install
npm run dev
```

La aplicación se ejecuta en:

- http://localhost:5173

La interfaz consulta el servicio API en `http://localhost:3000` por defecto. Para usar otra dirección, define `VITE_API_URL` en un archivo `.env` de este proyecto.

## Scripts disponibles

```bash
npm run dev     # arranca el entorno de desarrollo
npm run build   # compila la app para producción
npm run preview # previsualiza la build generada
```

## Estructura del proyecto

```text
GlobalFoods-Web/
├─ Documentacion/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ env.d.ts
├─ README.md
├─ GUIA-OPERATIVA.md
├─ FLUJO-APLICACION.md
├─ src/
│  ├─ inicio.ts
│  ├─ aplicacion/
│  │  ├─ Aplicacion.vue
│  │  └─ enrutador.ts
│  ├─ recursos/
│  │  ├─ logo-transparente.png
│  │  └─ CamaronesInicioSesion.jpg
│  ├─ componentes/
│  │  ├─ BarraLateralVue.vue
│  │  ├─ BotonVue.vue
│  │  ├─ CampoTextoVue.vue
│  │  ├─ ChipEstadoVue.vue
│  │  ├─ EncabezadoPanelVue.vue
│  │  ├─ EncabezadoSeccionVue.vue
│  │  ├─ IconoVue.vue
│  │  ├─ LayoutPanelVue.vue
│  │  ├─ PiePanelVue.vue
│  │  ├─ TablaVue.vue
│  │  ├─ TarjetaProductoVue.vue
│  │  └─ CATALOGO-COMPONENTES.md
│  ├─ estilos/
│  │  └─ tokens.css
│  ├─ modulos/
│  │  ├─ administracion/vistas/UsuariosVista.vue
│  │  ├─ almacen/
│  │  ├─ autenticacion/
│  │  │  ├─ servicios/servicioAutenticacion.ts
│  │  │  └─ vistas/InicioSesionVista.vue
│  │  ├─ principal/
│  │  │  └─ vistas/PanelVue.vue
│  │  ├─ reparto/
│  │  └─ ventas/
│  └─ pruebas/
```

## Rutas actuales

El enrutador está configurado con estas rutas principales:

- `/inicio-sesion` — pantalla de acceso
- `/panel` — vista principal del sistema
- `/usuarios` — listado de usuarios
- `/` — redirige a `/inicio-sesion`

## Organización y convenciones

- Los componentes se definen con `script setup` y extensión `.vue`.
- Se usa el alias `@` para acceder a `src`.
- `aplicacion/` contiene la vista raíz y el enrutador.
- `componentes/`, `estilos/` y `recursos/` guardan elementos compartidos.
- Cada carpeta de `modulos/` agrupa una capacidad del negocio con sus vistas, componentes, controladores, interfaces y servicios:
  - `vistas/` — pantallas y distribuciones
  - `componentes/` — elementos reutilizables del módulo
  - `controladores/` — lógica y estado
  - `interfaces/` — tipos TypeScript
  - `servicios/` — comunicación con el backend
- Los estilos usan CSS scoped y variables definidas en `src/estilos/tokens.css`.

## Flujo de trabajo recomendado

1. Instalar dependencias.
2. Ejecutar el proyecto con `npm run dev`.
3. Desarrollar nuevas vistas dentro del módulo correspondiente.
4. Reutilizar componentes en `src/componentes` antes de crear nuevas implementaciones.
5. Validar compilación con `npm run build` antes de entregar cambios.

## Estado del proyecto

La interfaz de inicio de sesión consulta `POST /api/auth/login`, conserva el token de acceso y dirige al panel. Las vistas de inventario y usuarios siguen usando datos de demostración.

## Documentación complementaria

- [GUIA-OPERATIVA.md](GUIA-OPERATIVA.md) — instalación, ejecución y diagnóstico
- [src/componentes/CATALOGO-COMPONENTES.md](src/componentes/CATALOGO-COMPONENTES.md) — catálogo de componentes reutilizables
- [Documentacion/](Documentacion/) — referencias y diseño del proyecto

## Nota

La dirección del servicio API puede cambiarse con `VITE_API_URL`; no agregues secretos del backend a este archivo ni al entorno del navegador.

