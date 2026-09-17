// ============================================================================
// servidor/index.js
// ============================================================================
//
//

//// - Levantar el servidor con node:http en el puerto configurado.
// - Crear el Ruteador y registrar en él las rutas reales del proyecto,
//   llamando a una función por recurso desde servidor/rutas/, por ejemplo:
//   registrarAuth(api), registrarPedidos(api), registrarClientes(api),
//   registrarProductos(api), registrarReportes(api).
// - Por cada petición que llega: si el camino no empieza con /api, servirla
//   como archivo estático (servidor/nucleo/estaticos.js); si empieza con
//   /api, buscar la ruta correspondiente, leer el cuerpo si aplica, correr
//   los middlewares (autenticación, autorización, idempotencia) y por
//   último llamar al manejador de esa ruta.
// - Atrapar cualquier error y traducirlo a una respuesta HTTP real con
//   servidor/nucleo/respuesta.js, para que el cliente siempre sepa si algo
//   salió bien o mal por el código de estado, nunca por adivinar.
//
