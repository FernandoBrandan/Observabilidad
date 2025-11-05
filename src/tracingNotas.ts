import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

// Storage Backends:
// + Prometheus for metrics
// + Loki for logs
// + Tempo for traces

const exporter = new OTLPTraceExporter({
	url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
	headers: {
		Authorization: process.env.YOUR_API_KEY as string,
	},
});

// Inicialización OpenTelemetry
const sdk = new NodeSDK({
	serviceName: 'todo-service',
	instrumentations: [getNodeAutoInstrumentations()],
	// traceExporter: new ConsoleSpanExporter(), // Exporta a consola -> Exporta a OTLP Collector
	traceExporter: exporter, // Exporta a OTLP Collector
});
// 4️⃣ Inicia el tracer
sdk.start()
// 	.then(() => {
// 	console.log('OpenTelemetry iniciado');
// }).catch((error: any) => {
// 	console.error('Error inicializando OpenTelemetry', error);
// });

// 5️⃣ Shutdown limpio (opcional pero recomendable)
process.on('SIGTERM', () => {
	sdk.shutdown()
		.then(() => console.log('OpenTelemetry cerrado correctamente'))
		.catch((err) => console.error('Error al cerrar OpenTelemetry', err))
		.finally(() => process.exit(0));
});


// ********************************************************************************
// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// Muestra logs internos de OpenTelemetry (opcional, útil para debug)
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);


// ********************************************************************************

// import { resourceFromAttributes } from '@opentelemetry/resources';
// import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, } from '@opentelemetry/semantic-conventions';
// const resource = resourceFromAttributes({
// 	[ATTR_SERVICE_NAME]: 'api-orders',
// 	[ATTR_SERVICE_VERSION]: '1.0.3',
// 	'deployment.environment': 'staging',
// });
// const sdk = new NodeSDK({
// 	resource,
// 	// otros params como processor, instrumentations, etc.
// });


// ******************************************************************************** 
// ******************************************************************************** 

// Qué hace:
// PeriodicExportingMetricReader: es un componente que recolecta métricas cada cierto intervalo (por defecto, cada 60s).
// ConsoleMetricExporter: simplemente imprime esas métricas en la consola estándar (stdout), en formato legible o JSON.
// Cuándo usarlo:
// Ideal para desarrollo o debugging local, porque ves en consola las métricas y verificás que tu instrumentación funciona.
// No sirve para producción, ya que nadie raspa la consola para obtener métricas.
// Ejemplo de salida:
// metric: http.server.duration [value: 120ms, labels: method=GET, route=/ping]

// import { PeriodicExportingMetricReader, ConsoleMetricExporter, } from '@opentelemetry/sdk-metrics';
// const sdk = new NodeSDK({
// 	metricReader: new PeriodicExportingMetricReader({
// 		exporter: new ConsoleMetricExporter(),
// 	}),
// });

// _____________________________________________________________________________


// Qué hace:
// PrometheusExporter expone un endpoint HTTP (/metrics) con todas las métricas en formato Prometheus.
// Prometheus, el sistema de monitoreo, hace “scrape” de esa URL cada cierto tiempo para recopilar datos.
// Cuándo usarlo:
// En entornos reales o de observabilidad completa, donde ya tenés Prometheus o Grafana recolectando métricas de tus servicios.
// Permite integrar fácilmente con dashboards, alertas, y correlación con trazas.
// Ejemplo de salida en /metrics:
// # HELP http_server_duration_seconds Duration of HTTP requests
// # TYPE http_server_duration_seconds histogram
// http_server_duration_seconds_bucket{method="GET",route="/ping",le="0.5"} 5
// http_server_duration_seconds_sum 0.43
// http_server_duration_seconds_count 5


// const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
// const prometheusExporter = new PrometheusExporter(
//   { port: 9091, endpoint: '/metrics' },
//   () => console.log('Prometheus scrape endpoint: http://localhost:9091/metrics')
// );
// const sdk = new NodeSDK({
//   metricReader: prometheusExporter,
// });

// ******************************************************************************** 
// ********************************************************************************

// Ejempo manual de creación y uso de un span
// SimpleSpanProcessor: exporta los spans uno por uno → útil para debug, consola, testing.
// BatchSpanProcessor: agrupa y exporta cada X spans o cada X milisegundos → más eficiente para producción.
// const sdk = new NodeSDK({
// spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
// spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
// });

// Reemplaza todo por 
// const sdk = new NodeSDK({
// traceExporter: new ConsoleSpanExporter(), el SDK internamente selecciona BatchSpanProcessor
// });

// ********************************************************************************
// spanProcessor Custom
// class FilteredSpanProcessor extends BatchSpanProcessor {
//   onEnd(span) {
//     if (span.name.includes('healthcheck')) return; // ignora spans innecesarios
//     super.onEnd(span);
//   }
// }