import winston from "winston";
import path from "path";
import { getCurrentTraceId } from "./tracingContext";

const logDir = path.join(process.cwd(), "logs");

const traceIdFormat = winston.format((info) => {
  const traceId = getCurrentTraceId();
  if (traceId) info.traceId = traceId;
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    traceIdFormat(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, traceId }) => {
      const traceInfo = traceId ? ` [traceId=${traceId}]` : "";
      return `[${timestamp}] ${level.toUpperCase()}: ${message}-${traceInfo}`
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "audit.log") }),
    new winston.transports.Console(),
  ],
});

export default logger;



// import LokiTransport from "winston-loki";
// Esto manda directamente los logs a Loki, sin intermediarios.
// Pero... no escala bien: si tu app genera miles de logs por segundo, saturás Loki.
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     traceIdFormat(),
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new LokiTransport({
//       host: process.env.LOKI_ENDPOINT || "http://localhost:3100",
//       labels: {
//         service: process.env.OTEL_SERVICE_NAME || "todo-service",
//         environment: process.env.NODE_ENV || "development",
//       },
//       json: true,
//       batching: true, // agrupa logs para eficiencia
//     }),
//   ],
// });


// Configuración de Promtail
// Archivo promtail-config.yaml:
// server:
//   http_listen_port: 9080
//   grpc_listen_port: 0

// positions:
//   filename: /tmp/positions.yaml

// clients:
//   - url: http://localhost:3100/loki/api/v1/push # tu Loki

// scrape_configs:
//   - job_name: node-app
//     static_configs:
//       - targets:
//           - localhost
//         labels:
//           job: "todo-service"
//           __path__: /var/log/*.log  # si usas archivo
//   - job_name: node-app-stdout
//     pipeline_stages:
//       - json:
//           expressions:
//             level: level
//             msg: message
//             traceId: traceId
//       - labels:
//           level:
//           traceId
