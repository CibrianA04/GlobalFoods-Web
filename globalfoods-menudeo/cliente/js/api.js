// ============================================================================
// cliente/js/api.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Es el único lugar del frontend que hace peticiones fetch() al servidor.
// En vez de que cada vista escriba su propio fetch, todas usan las funciones
// de aquí, así el manejo de errores, las cabeceras y el token de sesión
// están en un solo sitio y no repartidos por todo el cliente.
//
// ¿POR QUÉ ESTÁ EN cliente/js/?
// Porque es infraestructura del frontend que van a usar todas las vistas
// (ventas, almacén, reparto, admin) para hablar con la API bajo /api. Es el
// reemplazo casero de una librería como axios.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - Una función interna que arma la petición: agrega el encabezado
//   Content-Type, agrega el token guardado en localStorage si existe, hace
//   el fetch hacia BASE + camino, intenta leer la respuesta como JSON, y si
//   el servidor respondió con un código de error (gracias a que el backend
//   siempre manda códigos HTTP reales), lanza un Error de JavaScript con el
//   mensaje que vino del servidor.
// - Un objeto "api" con métodos cortos: obtener (GET), crear (POST), cambiar
//   (PATCH) y borrar (DELETE), para que las vistas escriban algo como
//   api.obtener('/pedidos') en vez de armar el fetch completo cada vez.
// - nuevaClaveIdempotencia(): genera un identificador único (UUID) en el
//   navegador que se manda al crear un pedido. Si la petición se reintenta
//   porque se cayó la conexión, el servidor reconoce esa misma clave y
//   devuelve el pedido que ya había creado, en vez de crear uno duplicado.
