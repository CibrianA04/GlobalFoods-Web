// ============================================================================
// compartido/estados.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Aquí vive la "máquina de estados" del pedido: la lista de estados posibles
// (pendiente, en_preparacion, listo, en_reparto, entregado, cancelado) y las
// reglas de qué estado puede pasar a cuál otro, y qué rol (ventas, almacén,
// reparto, administración) tiene permiso de hacer ese cambio.
//
// La regla de oro del proyecto es: NADIE cambia el campo "estado" de un
// pedido a mano. Siempre se pide una "transición", se valida contra las
// reglas de este archivo, y el cambio se guarda como un evento nuevo en una
// bitácora (nunca se sobrescribe el historial).
//
// ¿POR QUÉ ESTÁ EN LA CARPETA compartido/?
// Porque esta misma regla la necesitan DOS programas distintos: el servidor
// (Node) para no aceptar una transición inválida, y el navegador (cliente)
// para saber qué botones mostrarle a cada usuario según su rol. En vez de
// escribir la regla dos veces (y arriesgarse a que un día queden distintas),
// se escribe una sola vez aquí. Como es JavaScript estándar sin compilación,
// el servidor lo importa con "import" y el navegador con
// <script type="module">: es literalmente el mismo archivo en los dos lados.
// El día que exista una app nativa, también podrá importarlo.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - La lista de estados válidos del pedido (ESTADOS_PEDIDO).
// - Las etiquetas de texto y color de cada estado, para pintar siempre igual
//   el "chip" de estado en las cuatro pantallas (ETIQUETAS_ESTADO).
// - La tabla de transiciones permitidas: de qué estado a cuál otro, y qué
//   roles pueden dispararla (TRANSICIONES). Por ejemplo: almacén puede pasar
//   un pedido de "pendiente" a "en_preparacion", pero reparto no.
// - Funciones de consulta que usan esa tabla, por ejemplo:
//   - transicionPermitida(desde, hacia, rol) -> true/false
//   - siguientesEstados(desde, rol) -> qué estados puede elegir ese rol
//   - estadoEsFinal(estado) -> si el pedido ya no se puede volver a mover
// - Qué estados disparan una notificación de WhatsApp al cliente.
//
// Este archivo NO debe importar nada de node:http ni de mysql2: es lógica
// pura, sin depender de si corre en el servidor o en el navegador.
