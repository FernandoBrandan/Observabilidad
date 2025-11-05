"use strict";
// tracing.ts
// ============================================================================
// OpenTelemetry Configuration for Node.js
// Storage Backends:
// + Prometheus for metrics
// + Loki for logs
// + Tempo for traces
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
// Core SDK
const sdk_node_1 = require("@opentelemetry/sdk-node");
// Instrumentations (auto detect Express, HTTP, FS, etc.)
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
// Traces exporters
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
// Resources and metadata
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
// Diagnostic logs for debug (optional)
const api_1 = require("@opentelemetry/api");
api_1.diag.setLogger(new api_1.DiagConsoleLogger(), api_1.DiagLogLevel.INFO);
const resource = (0, resources_1.resourceFromAttributes)({
    [semantic_conventions_1.ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'todo-service',
    [semantic_conventions_1.ATTR_SERVICE_VERSION]: '1.0.3',
    'deployment.environment': process.env.NODE_ENV || 'development',
});
const traceExporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: { Authorization: process.env.YOUR_API_KEY || '', },
});
// Prometheus: ideal para producción
const prometheusExporter = new exporter_prometheus_1.PrometheusExporter({ port: 9091, endpoint: '/metrics' }, () => console.log('✅ Prometheus metrics at http://localhost:9091/metrics'));
const sdk = new sdk_node_1.NodeSDK({
    resource,
    traceExporter,
    metricReaders: [prometheusExporter],
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
});
sdk.start();
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('🟡 OpenTelemetry shutdown complete.'))
        .catch((err) => console.error('Error during OpenTelemetry shutdown', err))
        .finally(() => process.exit(0));
});
