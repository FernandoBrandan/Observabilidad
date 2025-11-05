// tracing.ts
// ============================================================================
// OpenTelemetry Configuration for Node.js
// Storage Backends:
// + Prometheus for metrics
// + Loki for logs
// + Tempo for traces
// ============================================================================

// Core SDK
import { NodeSDK } from '@opentelemetry/sdk-node';

// Instrumentations (auto detect Express, HTTP, FS, etc.)
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Traces exporters
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

// Metrics
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// Resources and metadata
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// Diagnostic logs for debug (optional)
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: '1.0.3',
    'deployment.environment': process.env.NODE_ENV,
});

const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    // headers: { Authorization: process.env.YOUR_API_KEY || '', },
});

// Prometheus: ideal para producción
const prometheusExporter = new PrometheusExporter(
    { port: 9091, endpoint: '/metrics' },
    () => console.log('✅ Prometheus metrics at http://localhost:9090/metrics')
);

const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReaders: [prometheusExporter],
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('🟡 OpenTelemetry shutdown complete.'))
        .catch((err) => console.error('Error during OpenTelemetry shutdown', err))
        .finally(() => process.exit(0));
});
