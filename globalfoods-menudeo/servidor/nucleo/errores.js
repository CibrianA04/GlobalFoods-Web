// ============================================================================
// servidor/nucleo/errores.js
// ============================================================================
//
// HTTP (400, 401, 403, 404, 409, etc.)
//

//
// - La clase ErrorHttp, que extiende Error y le agrega un código HTTP y,
//   opcionalmente, un detalle extra (por ejemplo, qué campo falló en una
//   validación).
// - Funciones "fábrica" cortas para los casos más comunes, como
//   errorPeticion (400, datos inválidos), errorNoAutenticado (401, no hay
//   sesión), errorProhibido (403, el rol no tiene permiso), errorNoEncontrado
//   (404) y errorConflicto (409, por ejemplo una clave de idempotencia
//   repetida). Así, en vez de escribir "throw new ErrorHttp(404, ...)" en
//   cada archivo, se escribe "throw errorNoEncontrado(...)" y es más claro
//   de leer.
