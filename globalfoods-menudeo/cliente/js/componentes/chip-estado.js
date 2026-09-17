// ============================================================================
// cliente/js/componentes/chip-estado.js
// ============================================================================
//
// ¿PARA QUÉ SIRVE ESTE ARCHIVO?
// Define un Web Component nativo del navegador llamado <chip-estado>, que
// se usa así en cualquier HTML del proyecto:
//
//   <chip-estado estado="en_preparacion"></chip-estado>
//
// y se pinta como una etiqueta de color que representa el estado de un
// pedido (por ejemplo, "En preparación" en su color correspondiente).
//
// ¿POR QUÉ ESTÁ EN cliente/js/componentes/?
// Porque esta carpeta es para piezas visuales reutilizables, sin lógica de
// negocio, que cualquier vista puede usar como si fueran una etiqueta HTML
// más. Es el reemplazo casero de un componente de Vue, pero usando
// "customElements", que es un estándar del navegador desde hace años y no
// necesita ninguna librería.
//
// ¿QUÉ LÓGICA DEBERÍA IR AQUÍ?
// - Una clase que extiende HTMLElement y se registra con
//   customElements.define('chip-estado', LaClase).
// - observedAttributes para reaccionar cuando cambia el atributo "estado".
// - Un método render() que lee el atributo "estado", busca su etiqueta de
//   texto y su color en ETIQUETAS_ESTADO (importado directamente desde
//   /compartido/estados.js, el MISMO archivo que usa el servidor), y arma
//   el HTML interno del chip usando las variables de color definidas en
//   cliente/css/tokens.css. Así, si el día de mañana se agrega un estado
//   nuevo en compartido/estados.js, este componente lo muestra correcto sin
//   tener que tocar nada aquí.
