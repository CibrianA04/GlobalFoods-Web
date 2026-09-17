# middleware/

Se registran con `api.usar(...)` y corren antes de cada ruta.

Pendientes:
- `autenticacion.js` — lee el token y pone `ctx.usuario`
- `autorizacion.js` — compara el rol contra la operacion
- `idempotencia.js` — deduplica por `clave_idempotencia`
- `cors.js` — solo hace falta si el cliente se sirve desde otro origen;
  en desarrollo el mismo servidor sirve los dos, asi que no aplica
