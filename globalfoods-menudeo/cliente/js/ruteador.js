// ============================================================================
// cliente/js/ruteador.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Es el ruteador del lado del navegador: decide qué "vista" (qué pantalla)
// mostrar según la URL actual, sin recargar la página completa. Usa la
// History API del navegador (pushState, popstate), que es exactamente lo
// que hace una librería como vue-router por debajo.
//
// ¿POR QUÉ ESTÁ EN cliente/js/?
// Porque es infraestructura de navegación del frontend, usada por main.js
// para conectar cada URL con la función de vista que le corresponde.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - Una clase Ruteador que recibe el elemento del DOM donde se va a pintar
//   el contenido (normalmente el <div id="app">).
// - Un método ruta(patron, vista) para registrar, por ejemplo, que la ruta
//   "/pedidos/:id" debe mostrarse con cierta función de vista.
// - Un método iniciar() que escucha el evento "popstate" (cuando se usa el
//   botón atrás/adelante del navegador) e intercepta los clics en enlaces
//   internos (<a href="/algo">) para navegar sin recargar la página.
// - Un método navegar(camino) que actualiza la URL con history.pushState y
//   vuelve a pintar.
// - Un método pintar() que busca la ruta que coincide con la URL actual,
//   llama a su función de vista (que devuelve HTML como texto) y lo coloca
//   dentro del contenedor. Si ninguna ruta coincide, muestra un mensaje de
//   "Página no encontrada".
