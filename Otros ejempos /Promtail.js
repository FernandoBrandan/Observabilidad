

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
