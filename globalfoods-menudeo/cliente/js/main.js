// ============================================================================
// cliente/js/main.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Es el punto de arranque del frontend: es el primer archivo de JavaScript
// que carga el navegador (referenciado desde cliente/index.html). Aquí se
// crea el ruteador del cliente, se registran las vistas reales de cada ruta
// y se conecta el "repintado automático" cuando cambia el estado global.
//
// ¿POR QUÉ ESTÁ EN cliente/js/ (y no dentro de una subcarpeta)?
// Porque es el archivo que "arranca" y conecta todo lo demás: el ruteador
// (ruteador.js), el estado global (estado.js) y los componentes que deben
// registrarse una sola vez (como <chip-estado>). Es el equivalente al
// main.js/App.vue de un proyecto con framework, pero sin framework.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - Importar y registrar los Web Components que se necesiten (por ejemplo,
//   importar cliente/js/componentes/chip-estado.js para que
//   customElements.define quede activo).
// - Crear el Ruteador pasándole el contenedor #app del HTML.
// - Registrar cada ruta real del proyecto con su vista correspondiente,
//   usando las funciones de cliente/js/vistas/ (por ejemplo, la vista de
//   login, la lista de pedidos de ventas, la cola de surtido de almacén,
//   las entregas del día de reparto, el panel de administración).
// - Llamar a ruteador.iniciar() para pintar la vista inicial.
// - Suscribirse con estado.alCambiar(...) para que, cada vez que cambie el
//   estado global, se vuelva a pintar la vista actual automáticamente.
