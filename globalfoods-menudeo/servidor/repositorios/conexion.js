// ============================================================================
// servidor/repositorios/conexion.js
// ============================================================================
//
// Crea y expone la conexión hacia la base de datos MySQL que usa todo el
// proyecto: un "pool" de conexiones (varias conexiones reutilizables en vez
// de abrir y cerrar una por cada consulta, que sería muy lento), y una
// función de ayuda para ejecutar varias operaciones SQL como una sola
// transacción (o pasan todas, o no pasa ninguna).

// - El pool de conexiones (pool), configurado con host, usuario, contraseña
//   y nombre de base de datos leídos de variables de entorno (nunca escritos
//   directamente en el código, por seguridad).
// - La función enTransaccion(trabajo), que abre una conexión, empieza una
//   transacción, ejecuta el trabajo recibido, y hace commit si todo salió
//   bien o rollback si algo falló. Se usa, por ejemplo, cuando un pedido
//   cambia de estado: hay que actualizar la fila del pedido Y agregar un
//   renglón nuevo en la bitácora de eventos, y las dos cosas deben quedar
//   guardadas juntas o ninguna de las dos.
//
// El resto de los archivos de esta carpeta (por ejemplo pedidos.js,
// clientes.js, productos.js, que todavía no existen) deberían exportar una
// función por cada operación de base de datos, siempre con consultas
// parametrizadas (usando "?"), nunca concatenando valores directamente en el
// texto del SQL.
