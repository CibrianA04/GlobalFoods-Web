# vistas/

Una carpeta por rol. Cada vista exporta una funcion que recibe los
parametros de la ruta y devuelve HTML como cadena.

```js
export function vistaPedidos() {
  return `<ul>${estado.pedidos.map(fila).join('')}</ul>`;
}
```

Pendientes:
- `ventas/` — inicio, lista de pedidos, captura de pedido
- `almacen/` — cola de surtido, captura de peso real
- `reparto/` — entregas del dia por zona
- `admin/` — panel y reportes
- `login.js`

Los prototipos de referencia estan en el lienzo de diseno del equipo.
