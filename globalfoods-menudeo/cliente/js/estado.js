// ============================================================================
// cliente/js/estado.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Guarda el "estado global" de la aplicación en el navegador: por ejemplo,
// quién es el usuario que inició sesión, cuáles son los pedidos que se están
// mostrando, si la app está cargando algo y si hay un error que mostrar. Y
// lo más importante: avisa automáticamente a quien le interese cuando algo
// de ese estado cambia.
//
// ¿POR QUÉ ESTÁ EN cliente/js/?
// Porque es una pieza de infraestructura del frontend, no de una vista en
// particular: main.js y las vistas la usan para leer y modificar datos
// compartidos por toda la aplicación.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - Un objeto plano con los datos iniciales (usuario, pedidos, cargando,
//   error).
// - Un Proxy de JavaScript que envuelve ese objeto: cada vez que alguien
//   hace "estado.pedidos = [...]" o "estado.cargando = true", el Proxy
//   intercepta esa asignación y avisa a todos los "suscriptores"
//   registrados. Esto reemplaza la reactividad automática que daría un
//   framework como Vue, pero de forma explícita: aquí se ve claramente en
//   el código cuándo se avisa un cambio.
// - Una función estado.alCambiar(funcion) para que otra parte del código
//   (normalmente el ruteador del cliente) se suscriba y vuelva a pintar la
//   pantalla cada vez que el estado cambia.
