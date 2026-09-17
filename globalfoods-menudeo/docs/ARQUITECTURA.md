# Arquitectura — Sistema de pedidos de menudeo

Global Foods México · Proyecto Integrador · Instituto Tecnológico de Culiacán

Este documento explica **cómo** se construye el sistema y **por qué** de cada
decisión. Si algo aquí deja de ser cierto, se actualiza el documento antes de
cambiar el código.

---

## 1. Qué condiciona el diseño

Del modelado del negocio salen cuatro restricciones. No son detalles de
implementación: son la razón de ser del sistema.

1. **La venta ocurre lejos del sistema.** La congeladora está a treinta
   minutos de la ciudad y la asesora levanta pedidos por WhatsApp, por
   teléfono o visitando clientes. El pedido tiene que poder originarse desde
   donde ella esté.
2. **Lo pedido no es lo surtido.** El camarón se vende por peso y la masa
   real casi nunca cae exacta. Un modelo con un solo campo de cantidad
   produce importes equivocados.
3. **El almacén trabaja en frío.** Guantes, humedad, pantallas empañadas. La
   interfaz de surtido no puede ser la misma que la de ventas.
4. **El estado administrativo no refleja el estado logístico.** Hoy la salida
   de almacén se interpreta como pedido concluido aunque la entrega siga
   pendiente. Hay que separar las dos cosas.

A eso se suman dos restricciones del curso:

5. **Sin frameworks.** Ni en el frontend ni en el backend.
6. **La app de la asesora será nativa y va después.** El servidor tiene que
   servir a dos clientes distintos.

---

## 2. Decisiones y por qué

### JavaScript en los dos lados

En el navegador no hay opción. La decisión real era el backend, y ahí la
restricción 5 inclina la balanza más de lo que parece:

El módulo `node:http` es exactamente aquello sobre lo que está construido
Express. Quitarle Express nos quita el ruteo y el parseo del cuerpo, que son
unas cien líneas que además se entienden completas. Es un servidor real,
asíncrono, que aguanta peticiones concurrentes.

El equivalente en Python sería `http.server`, que la propia documentación
advierte que no es para producción: atiende una petición a la vez. Construir
algo decente encima sería reimplementar medio WSGI.

Y hay un beneficio que solo aparece con JavaScript en ambos lados: la
**máquina de estados se escribe una sola vez**. El archivo
`compartido/estados.js` lo importa el servidor con `import` de Node y el
navegador con `<script type="module">`. Es el mismo archivo, sin copiar,
sin compilar. Cuando llegue la app nativa, lo importa también.

### JavaScript plano con JSDoc, no TypeScript

TypeScript no es un framework, pero exige un paso de compilación. Sin él, lo
que escribimos es lo que corre: se puede abrir el archivo en el navegador y
depurarlo tal cual.

Los tipos se declaran con comentarios JSDoc (`compartido/tipos.js`). VS Code
los entiende y autocompleta igual. Si la profesora permite TypeScript, migrar
es renombrar archivos y mover los `@typedef` a `interface`.

### MySQL

Es lo que los dos ya usaron y lo que está montado en la escuela.
`DECIMAL(10,3)` resuelve lo de los pesos, que era la única preocupación
técnica real. **Nunca `FLOAT`**: `0.1 + 0.2 !== 0.3` y aquí eso se traduce en
importes mal cobrados.

### El servidor sirve también el frontend

En desarrollo, `servidor/nucleo/estaticos.js` entrega los archivos de
`cliente/` y `compartido/`. Así no hay que levantar dos procesos ni pelear
con CORS. En producción eso lo haría el servidor web de la escuela.

---

## 3. Forma del sistema

```
                    ┌─────────────────────┐
                    │      MySQL 8        │
                    └──────────┬──────────┘
                               │ mysql2
                    ┌──────────┴──────────┐
                    │  Servidor (node:http)│
                    │  rutas → servicios   │
                    │       → repositorios │
                    └──────────┬──────────┘
                               │ HTTP / JSON
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────┴──────┐  ┌──────┴───────┐  ┌─────┴────────┐
     │   Navegador   │  │  App nativa  │  │   WhatsApp   │
     │  (módulos ES) │  │   (fase 2)   │  │  Cloud API   │
     └───────┬───────┘  └──────┬───────┘  └──────────────┘
             │                 │
             └────────┬────────┘
                      │
            ┌─────────┴──────────┐
            │   compartido/      │
            │  estados.js        │
            │  tipos.js          │
            └────────────────────┘
```

La consecuencia práctica: **ninguna regla de negocio vive en el frontend**.
Si la validación de una transición estuviera en el navegador, habría que
reescribirla en el móvil y las dos versiones se separarían con el tiempo.

---

## 4. Estructura del repositorio

```
globalfoods-menudeo/
├── compartido/          Lo que usan servidor y navegador (y el móvil futuro)
│   ├── estados.js       Máquina de estados: transiciones y quién las dispara
│   └── tipos.js         Typedefs JSDoc
│
├── servidor/
│   ├── index.js         Levanta node:http, arma el contexto, delega
│   ├── nucleo/          Ruteador, respuestas, errores, estáticos
│   ├── rutas/           HTTP: validar, llamar, responder
│   ├── servicios/       Reglas de negocio
│   ├── repositorios/    Único lugar con SQL
│   ├── middleware/      Auth, roles, idempotencia
│   └── integraciones/   WhatsApp
│
├── cliente/
│   ├── index.html
│   ├── css/tokens.css   Colorimetría de la marca
│   └── js/
│       ├── main.js
│       ├── estado.js        Estado global con notificación de cambios
│       ├── ruteador.js      History API
│       ├── api.js           Único lugar con fetch
│       ├── componentes/     Web Components nativos
│       └── vistas/          Una carpeta por rol
│
├── db/
│   ├── esquema.sql
│   └── datos-iniciales.sql  Catálogo real de productos
│
└── docs/
```

**La regla de las tres capas:** `rutas/` no sabe de SQL, `servicios/` no sabe
de HTTP, `repositorios/` es el único que escribe consultas. Si mañana el
inventario se lee del sistema interno en lugar de nuestra base, solo cambia
`repositorios/`.

---

## 5. Qué reemplaza a cada cosa del framework

| Lo que daba el framework | Cómo se resuelve aquí |
|---|---|
| Ruteo del servidor (Express) | `servidor/nucleo/ruteador.js`, ~70 líneas |
| Parseo del body (`express.json`) | `leerCuerpoJson` en `nucleo/respuesta.js`, con límite de tamaño |
| Reactividad (Vue) | `cliente/js/estado.js`: un `Proxy` que avisa a los suscriptores al asignar |
| Componentes (Vue) | Web Components nativos con `customElements.define` |
| Ruteo del cliente (vue-router) | `cliente/js/ruteador.js` con History API |
| Empaquetado (Vite) | Módulos ES nativos. Ningún navegador actual los necesita empaquetados |
| Cliente HTTP (axios) | `fetch`, envuelto en `cliente/js/api.js` |

Lo único que se pierde de verdad es la reactividad fina de Vue: aquí, cuando
el estado cambia, se vuelve a pintar la vista completa. Para el volumen de
este sistema no se nota.

---

## 6. El pedido y sus estados

```
   pendiente ─────▶ en_preparacion ─────▶ listo ─────▶ en_reparto ─────▶ entregado
      │                    │                 │              │                 ▲
      │                    │                 └──────────────────────────────────┘
      │                    │                 (compra directa en congeladora)
      ▼                    ▼                 ▼              ▼
  cancelado            cancelado         cancelado      cancelado
```

Cada transición declara qué roles pueden dispararla. Almacén no puede marcar
entregado un pedido a domicilio; reparto no puede ponerlo en preparación.

### Por qué una bitácora y no solo un campo

`evento_pedido` es inmutable: solo se insertan filas. De ahí salen, sin
trabajo extra:

- La trazabilidad que pide el modelado del negocio
- Los tiempos por etapa (pedido → listo, listo → entregado)
- Los reportes de cumplimiento del panel administrativo
- La respuesta a "¿quién cambió esto y cuándo?" ante una discrepancia

El campo `estado` en `pedido` es una copia del último evento, para no
recalcularlo en cada consulta de lista. **Actualizar el pedido y escribir el
evento van en la misma transacción** — para eso está `enTransaccion` en
`repositorios/conexion.js`.

### Peso solicitado vs. peso surtido

`partida_pedido` tiene `kg_solicitados` y `kg_surtidos` separados. El almacén
captura el segundo durante el surtido, y **el importe se calcula sobre
`kg_surtidos`**. Por eso el cierre comercial ocurre después del surtido y no
al generar la salida como pasa hoy.

Esto resuelve directamente los problemas 2 y 4 de la sección 1.

---

## 7. Idempotencia

Cada pedido lleva una `clave_idempotencia` **generada por el cliente**
(`crypto.randomUUID()` en el navegador), no por el servidor. El `UNIQUE` de
la columna hace el resto: si el envío se reintenta porque se cayó la red, el
servidor reconoce la clave y devuelve el pedido existente en vez de crear
uno nuevo.

Hoy la web está siempre en línea y no parece necesario. Se pone desde ahora
porque cuando la app nativa sincronice pedidos levantados sin señal, el
contrato de la API ya no va a poder cambiar.

Lo mismo con `notificacion.clave_envio`, derivada de (pedido, estado): un
reintento no manda el mismo WhatsApp dos veces.

---

## 8. La pregunta abierta más importante

**Cómo se conecta con el sistema interno existente.** El modelado del negocio
dice que la empresa ya tiene un sistema para clientes, pedidos, ventas, pagos
e inventario, y que nuestra solución lo *extiende* en vez de reemplazarlo.
Pero no está definido cómo.

Tres escenarios, en orden de preferencia:

1. **Tiene API o base de datos accesible.** Ideal. Nuestra app es una capa de
   captura y estados; el inventario se lee de allá y la venta se escribe allá.
2. **Permite exportación e importación programada.** Aceptable, con una
   ventana de desfase conocida y aceptada por la empresa.
3. **Es una caja cerrada.** Problema serio: habría que duplicar catálogos e
   inventario y reconciliar a mano, justo el tipo de inconsistencia que el
   proyecto busca eliminar.

`db/esquema.sql` asume el escenario 3 porque es el que más trabajo requiere;
migrar de 3 a 1 quita código, no lo agrega.

**Acción pendiente:** preguntar a la empresa qué sistema es y si expone API.

---

## 9. Otras cosas por definir

- **Precios.** No los tenemos. `precio_unitario` está nullable. Falta saber
  si el precio es fijo por producto, por cliente o negociado por pedido.
- **Cobro a la entrega.** Si el repartidor cobra, hay que registrar el cobro
  efectivo y conciliarlo. No está modelado.
- **Faltantes.** Qué pasa cuando el almacén no puede surtir lo solicitado:
  ¿se ajusta la partida, se cancela, se avisa a ventas para que confirme?
- **Usuarios.** Si ya existen en el sistema interno, el login solo valida
  contra él y no hace falta pantalla de alta. **No habrá registro público:**
  las cuentas las da de alta un administrador.
- **Vehículos de reparto.** Depende de si reparten con más de una unidad.

---

## 10. Cómo levantar el proyecto

```bash
npm install
cp .env.example .env              # llenar las credenciales de MySQL
mysql -u root -p < db/esquema.sql
mysql -u root -p < db/datos-iniciales.sql
npm run dev
```

Todo queda en `http://localhost:3001`: la API bajo `/api` y el frontend en la
raíz. `node --watch` reinicia solo al guardar.

---

## 11. Convenciones

- Código, comentarios y documentación en español.
- Las reglas de negocio viven en `servidor/servicios/`. Nunca en el cliente.
- Solo `servidor/repositorios/` escribe SQL, y siempre con consultas
  parametrizadas (`?`).
- Los errores responden con su código HTTP real. Nunca un 200 con un texto
  de error: el cliente no podría distinguir éxito de fallo.
- Las credenciales van en `.env`, que está en `.gitignore`.
- Nada de `build/`, `.DS_Store` ni `__MACOSX` versionados.
