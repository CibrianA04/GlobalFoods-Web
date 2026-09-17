# integraciones/whatsapp/

Dos flujos que conviene no mezclar.

**Salida.** Notificaciones de estado. Son consecuencia de una transicion,
no una accion manual. Plantilla con datos sustituidos, sin IA.

> Las plantillas de WhatsApp Cloud API requieren aprobacion previa de
> Meta. Hay que registrarlas y esperar el visto bueno antes de poder
> enviar fuera de la ventana de 24 horas. Ese tramite no depende de
> nosotros: conviene empezarlo pronto.

**Entrada.** Consultas del cliente ("¿ya salio mi pedido?"). Aqui entra el
agente de IA: consulta el estado real por la API y responde. El agente
**lee, nunca escribe** ni cambia estados.
