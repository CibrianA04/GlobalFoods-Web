# servicios/

Las reglas de negocio. No importan `node:http` ni `mysql2`: reciben datos
y hablan con `repositorios/`.

Pendientes:
- `pedidos.js` — crear pedido (idempotente), calcular importe con peso real
- `transiciones.js` — valida contra `compartido/estados.js`, actualiza el
  pedido y escribe el evento **en la misma transaccion**
- `notificaciones.js` — decide que mensaje toca y lo encola
- `inventario.js` — disponibilidad de las posiciones asignadas a ventas
- `folios.js` — genera el folio consecutivo del pedido
