# repositorios/

El unico lugar del proyecto que escribe SQL. Si manana el inventario deja
de vivir en nuestra base y se lee del sistema interno de la empresa, solo
cambia este directorio.

`conexion.js` ya esta: trae el pool y el ayudante `enTransaccion`.

Reglas:
- Siempre consultas parametrizadas (`?`), nunca concatenar valores.
- Una funcion por operacion, con nombre que diga que hace.
