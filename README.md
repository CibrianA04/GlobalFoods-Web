# Global Foods México — Web

## Integrantes

- Cibrian Robles José Alonso — 22170613
- Olivarria García Luis Fernando — 22170748
- Ontiveros Ramos Victoria Adahi — 22170749
- Parroquin Diaz Dianne — 22170765
- Valenzuela Arce Roberto — 22170843
- Verdugo Varela Cesar Enrique — 22170850

Frontend en Vue 3 + Vite + TypeScript.

```bash
npm install
npm run dev
```


## Estructura
```
src/
  main.ts
  App.vue
  router/index.ts          registro de rutas
  assets/
    tokens.css             Colorimetría
    logo.jpeg
  modulos/
    auth/                  Login
    principal/             Página de inicio
    ventas/
    almacen/
    reparto/
    admin/
```

Cada módulo tiene:

- `vistas/` — las pantallas
- `componentes/` — piezas reutilizables dentro del módulo
- `controladores/` — composables con la lógica y el estado
- `api/` — llamadas al backend
- `interfaces/` — tipos de TypeScript

