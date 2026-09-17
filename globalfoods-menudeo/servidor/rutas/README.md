# rutas/

Un archivo por recurso. Cada uno exporta una funcion que recibe el
ruteador y registra sus rutas.

Solo validan la entrada, llaman al servicio y devuelven el resultado.
**Nada de SQL ni de reglas de negocio aqui.**

```js
export function registrarPedidos(api) {
  api.get('/api/pedidos', async (ctx) => pedidosServicio.listar(ctx.query));
  api.post('/api/pedidos', async (ctx) => pedidosServicio.crear(ctx.cuerpo, ctx.usuario));
}
```

Pendientes:
- `auth.js` — login, refresh
- `pedidos.js` — crear, listar, detalle, transicionar, capturar peso real
- `clientes.js` — alta, edicion, busqueda
- `productos.js` — catalogo y disponibilidad
- `reportes.js` — resumen por etapa, tiempos, ventas
