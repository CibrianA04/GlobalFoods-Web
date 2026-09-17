// ============================================================================
// servidor/nucleo/ruteador.js
// ============================================================================
//
// qué función debeatender una petición según su método HTTP (GET, POST, PUT, PATCH,
// DELETE) y su camino (por ejemplo "/api/pedidos/:id"). Es exactamente lo
// que hace el ruteo de Express, escrito a mano en unas pocas líneas, porque
// el proyecto no usa frameworks.
//
// guarda las piezas de infraestructura genéricas que
// reemplazan lo que un framework daría gratis: ruteo, manejo de respuestas,
// manejo de errores y servido de archivos estáticos. 
// - Una clase Ruteador que guarda una lista de rutas registradas (método +
//   patrón de camino + función que la atiende).
// - Métodos get/post/put/patch/borrar para registrar una ruta de cada tipo.
// - Un método usar(...) para registrar middlewares que corren antes de
//   cualquier ruta (por ejemplo, autenticación).
// - Un método resolver(metodo, camino) que recorre las rutas registradas y
//   encuentra la que coincide, extrayendo los parámetros de la URL (por
//   ejemplo, de "/api/pedidos/7" saca params.id = "7").
