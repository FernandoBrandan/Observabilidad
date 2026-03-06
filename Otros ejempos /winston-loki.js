
//
// import LokiTransport from "winston-loki";
// Esto manda directamente los logs a Loki, sin intermediarios.
// Pero... no escala bien: si tu app genera miles de logs por segundo, saturás Loki.
 const logger = winston.createLogger({
   level: "info",
   format: winston.format.combine(
     traceIdFormat(),
     winston.format.timestamp(),
     winston.format.json()
   ),
   transports: [
     new winston.transports.Console(),
     new LokiTransport({
       host: process.env.LOKI_ENDPOINT || "http://localhost:3100",
       labels: {
         service: process.env.OTEL_SERVICE_NAME || "todo-service",
         environment: process.env.NODE_ENV || "development",
       },
       json: true,
       batching: true, // agrupa logs para eficiencia
     }),
   ],
 });