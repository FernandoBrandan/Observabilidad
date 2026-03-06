// Métricas Prometheus → visibilidad de rendimiento y uso.
// counter, gauge, histogram y summary

import client from "prom-client";
const register = new client.Registry();

// Métricas personalizadas
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de requests HTTP recibidos",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de requests en segundos",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Registrar métricas
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.setDefaultLabels({ app: "gateway" });
client.collectDefaultMetrics({ register });

export { register, httpRequestsTotal, httpRequestDuration };

