# Global Foods México — Pedidos de menudeo

Sistema de gestión de pedidos de venta al menudeo: captura desde ventas,
surtido en almacén, reparto y seguimiento al cliente por WhatsApp.

Proyecto Integrador · Ingeniería en Sistemas Computacionales
Instituto Tecnológico de Culiacán

## Stack

JavaScript en los dos lados, **sin frameworks**.

- **Servidor:** Node 22 con `node:http`
- **Base de datos:** MySQL 8 con `mysql2`
- **Cliente:** módulos ES nativos y Web Components
- **Tipos:** JSDoc (sin compilación)

La única dependencia del proyecto es `mysql2`, porque hablar con MySQL a
pelo no es razonable. Todo lo demás es estándar de Node y del navegador.

## Estado

Esqueleto. El núcleo está escrito y funciona: ruteador, manejo de errores,
conexión con transacciones, máquina de estados y el componente de chip.
Las rutas, servicios y vistas están por hacer, cada carpeta con un README
que dice qué va adentro.

## Requisitos

- Node 22 (`nvm use`)
- MySQL 8

## Arrancar

```bash
npm install
cp .env.example .env              # llenar las credenciales de MySQL
mysql -u root -p < db/esquema.sql
mysql -u root -p < db/datos-iniciales.sql
npm run dev
```

Todo en `http://localhost:3001`: la API bajo `/api`, el frontend en la raíz.

## Estructura

```
compartido/   Máquina de estados y tipos. Los usa el servidor Y el navegador.
servidor/     API HTTP sobre node:http
cliente/      Frontend en módulos ES
db/           Esquema SQL y catálogo de productos
docs/         Arquitectura y decisiones
```

## Antes de escribir código

Lee [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md). Explica por qué el peso
solicitado y el surtido son campos distintos, por qué los estados se cambian
con transiciones en vez de asignando el campo, qué reemplaza a cada cosa que
daría un framework, y qué está sin definir todavía.

## Convenciones

- Código, comentarios y documentación en español.
- Las reglas de negocio viven en `servidor/servicios/`. Nunca en el cliente.
- Solo `servidor/repositorios/` escribe SQL, siempre con `?`.
- Los errores responden con su código HTTP real, nunca un 200 con texto.
- Credenciales en `.env`, que está en `.gitignore`.

## Equipo

| Área | Responsables |
|---|---|
| Desarrollo web | Alonso, Victoria |
| Resto del equipo | por asignar |
