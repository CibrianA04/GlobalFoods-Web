// ============================================================================
// servidor/nucleo/estaticos.js
// ============================================================================
//
// Durante el desarrollo, este archivo permite que el mismo servidor Node
// entregue los archivos del navegador (todo lo que está en cliente/ y en
// compartido/, como el HTML, el CSS y el JavaScript del cliente). Así no
// hace falta levantar un segundo servidor solo para el frontend, ni pelear
// con problemas de CORS entre dos orígenes distintos. En producción, esta
// tarea normalmente la haría un servidor web dedicado como nginx o Apache.
//

//
// - Una tabla de tipos de contenido (Content-Type) según la extensión del
//   archivo (.html, .css, .js, .svg, etc.).
// - La función servirEstatico(raiz, camino, res), que:
//   1. Revisa que el camino pedido no intente "escaparse" de la carpeta del
//      proyecto usando "..", por seguridad (para que nadie pida algo como
//      /../../.env).
//   2. Si piden "/", sirve cliente/index.html.
//   3. Si el camino empieza con "/compartido/", lo busca ahí.
//   4. Si no, lo busca dentro de cliente/.
//   5. Si el archivo existe, lo envía con el Content-Type correcto; si no
//      existe, devuelve false para que quien lo llamó responda 404.
