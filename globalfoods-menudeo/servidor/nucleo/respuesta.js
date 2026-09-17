// ============================================================================
// servidor/nucleo/respuesta.js
// ============================================================================
//
// Reúne las funciones para "hablar" con el cliente de forma consistente:
// cómo responder JSON con el código HTTP correcto, cómo convertir cualquier
// error (esperado o no) en una respuesta HTTP real, y cómo leer y convertir
// a JSON el cuerpo que manda el cliente en un POST/PUT/PATCH. Esto último es
// lo que en Express haría el middleware express.json() automáticamente.
// - responderJson(res, codigo, datos): arma la respuesta con el
//   Content-Type y Content-Length correctos y la envía.
// - responderError(res, error): si el error es uno de los "ErrorHttp"
//   definidos en errores.js, responde con su código real (400, 401, 403,
//   404, 409...); si es un error inesperado, responde 500 sin exponer
//   detalles internos al cliente, pero sí lo registra en la consola del
//   servidor para poder investigarlo.
// - leerCuerpoJson(req): junta los pedazos del cuerpo de la petición, pone
//   un límite de tamaño (para que nadie tumbe el servidor mandando un
//   cuerpo gigante) y lo convierte de texto a un objeto JavaScript con
//   JSON.parse, o lanza un error 400 si no es JSON válido.
//

