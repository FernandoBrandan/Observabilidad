# 🧩 Mapa de Observabilidad — Métricas | Logs | Tracing
| Nivel / Función                                              | 📈 **MÉTRICAS**                                                               | 📜 **LOGS**                                                                       | 🕸️ **TRACING**                                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **1️⃣ Instrumentación (SDK / Agente en tu app)**             | `OpenTelemetry SDK (metrics)`<br>`Prometheus client`<br>`StatsD client`       | `OpenTelemetry SDK (logs)`<br>`Winston` / `Pino` / `Bunyan`<br>`Fluent Bit agent` | `OpenTelemetry SDK (traces)`<br>`Jaeger client` (legacy)<br>`Zipkin client` (legacy) |
| **2️⃣ Recolección / Agregación (Collector o intermediario)** | `OpenTelemetry Collector`<br>`Prometheus Server` (scraper)<br>`StatsD daemon` | `OpenTelemetry Collector`<br>`Fluentd` / `Fluent Bit` / `Vector`                  | `OpenTelemetry Collector`<br>`Jaeger Agent / Collector`<br>`Zipkin Collector`        |
| **3️⃣ Almacenamiento / Backend de datos**                    | `Prometheus`<br>`Grafana Mimir`<br>`VictoriaMetrics`<br>`CloudWatch Metrics`  | `Grafana Loki`<br>`Elasticsearch`<br>`Datadog Logs`<br>`CloudWatch Logs`          | `Grafana Tempo`<br>`Jaeger`<br>`Zipkin`<br>`AWS X-Ray`                               |
| **4️⃣ Visualización / Observabilidad Unificada**             | `Grafana`<br>`Datadog Dashboards`<br>`NewRelic`                               | `Grafana` (Loki plugin)<br>`Kibana`<br>`Datadog Logs`                             | `Grafana` (Tempo plugin)<br>`Jaeger UI`<br>`Honeycomb`                               |
| **5️⃣ Correlación cruzada (traces ↔ metrics ↔ logs)**        | `Grafana Tempo + Loki + Mimir` stack<br>`Datadog / NewRelic / OpenObserve`    | `Grafana Tempo + Loki + Mimir` stack<br>`Elastic Stack (ELK)`                     | `Grafana Tempo + Loki + Mimir` stack<br>`Datadog APM`                                |

# 💡 Combinaciones comunes (stacks reales)

| Stack                           | Descripción                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Grafana Stack (Open Source)** | OpenTelemetry SDK → OTel Collector → Tempo (traces), Loki (logs), Mimir (metrics) → Grafana UI |
| **Elastic Stack (ELK + APM)**   | Elastic APM agent → Elasticsearch → Kibana                                                     |
| **Datadog SaaS Stack**          | Datadog Agent → Datadog Cloud (traces, logs, metrics, all-in-one)                              |
| **AWS Native Stack**            | OpenTelemetry SDK → AWS Distro for OTel (ADOT) → CloudWatch (metrics/logs) + X-Ray (tracing)   |



# Cheat sheet resumido de OpenTelemetry para Node.js 

```
Trace (flujo completo de una operación)
 ├─ Span "request HTTP /todo"
 │   ├─ Span "query MongoDB"
 │   └─ Span "procesamiento adicional"
 └─ Span "request HTTP /todo/:id"
```

### 1️⃣ **Conceptos básicos**

| Concepto             | Qué hace / para qué sirve |
| --- | --- |
| **Trace**            | Flujo completo de una operación, compuesto por varios spans (ej. request HTTP → DB → respuesta). Agrupa spans relacionados.                  |
| **Tracer**           | Herramienta/Objeto que permite **crear spans manuales** (`tracer.startSpan(...)`).                                                           |
| **Span**             | Unidad de trabajo dentro de un trace (ej. request, query DB, procesamiento).                                                                 |
| **Instrumentations** | Generan **spans automáticos** para librerías o frameworks (HTTP, Express, MongoDB, gRPC, etc.).                                              |
| **SpanProcessor**    | Recibe los spans (manuales o automáticos) y decide **cómo y cuándo enviarlos** a los exporters. Ej: SimpleSpanProcessor, BatchSpanProcessor. |
| **Exporter**         | Envía los spans a un destino: consola, OTLP, Jaeger, Zipkin, etc.                                                                            |

### 2️⃣ **Flujo de ejecución**

```
Manual Span:
Tracer.startSpan() --> SpanProcessor --> Exporter --> Backend

Automatic Span:
Instrumentation (Express, Mongo, HTTP) --> SpanProcessor --> Exporter --> Backend
```

* Todo span (manual o automático) **pasa por un SpanProcessor** antes de llegar al Exporter.
* Instrumentations **no reemplazan el SpanProcessor**, solo generan spans automáticamente.

---

### 4️⃣ **Reglas rápidas / recomendaciones**

* Siempre necesitás al menos **un SpanProcessor + un Exporter**.
* Instrumentations son opcionales, pero muy útiles para evitar crear todos los spans manualmente.
* Trace = “flujo completo”, Span = “unidad de trabajo”.
* Tracer = “herramienta para crear spans manuales”.

---

## 🔹 1️⃣ Categorías de dependencias

### **A. Core / API**

* `@opentelemetry/api` ✅ **infaltable**

  * Contiene las interfaces y la API global (`trace`, `metrics`) que vos vas a usar para crear spans manuales o leer métricas.
  * Siempre necesario incluso si solo usás instrumentations automáticas.

* `@opentelemetry/core`

  * Contiene implementaciones no-op y utilidades base.
  * Solo lo necesitás si querés personalizar el Provider sin usar el SDK completo.

---

### **B. SDK / Implementaciones**

* `@opentelemetry/sdk-node` ✅ **infaltable para Node.js**

  * Es el “todo en uno” que ya incluye:

    * NodeTracerProvider
    * SpanProcessor default
    * Registro global (`trace.getTracer()`)
    * Soporte para instrumentations automáticas
  * Reemplaza la necesidad de usar manualmente `sdk-trace-node` + `core` para la mayoría de los casos de Node.js server.

* `@opentelemetry/sdk-trace-base`

  * Contiene los SpanProcessors (`SimpleSpanProcessor`, `BatchSpanProcessor`) y Exporters básicos.
  * Necesario si querés **controlar los span processors y exporters manualmente**.

* `@opentelemetry/sdk-trace-node`

  * Era la implementación clásica para Node.js antes de `sdk-node`.
  * Hoy `sdk-node` lo engloba y simplifica, así que generalmente **no necesitás instalarlo separado**.

* `@opentelemetry/sdk-metrics`

  * Para métricas, no trazas. Solo necesario si querés medir latencias, contadores, gauges.

---

### **C. Instrumentations**

* `@opentelemetry/auto-instrumentations-node`

  * Paquete “meta” que trae **todas las instrumentations populares** de Node.js (HTTP, Express, MongoDB, etc.)
  * Muy útil si querés habilitar instrumentación automática sin importar librerías individuales.

* `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-express`, etc.

  * Son instrumentaciones **individuales**, las podés usar si solo querés medir ciertas librerías.
  * Ej: si solo querés Express y MongoDB, no necesitas `auto-instrumentations-node`.

---

## 🔹 2️⃣ Patrón para tu flujo de desarrollo

Según tu manera de pensar:

1. **Decidir auto o manual**

   * Manual: solo necesitas `@opentelemetry/api` + `NodeSDK` (o `sdk-trace-base`) + `SpanProcessor + Exporter`.
   * Automático: agregás `instrumentations` o `auto-instrumentations-node`.

2. **Configurar SpanProcessor**

   * Simple o Batch, depende del volumen.
   * Con `NodeSDK` podés pasar `spanProcessor` o `traceExporter` (NodeSDK internamente crea un processor si pasás un exporter).

3. **Configurar Exporters**

   * Ej: `ConsoleSpanExporter`, `OTLPTraceExporter`, `JaegerExporter`.
   * Pueden ser múltiples.

4. **Registrar el Tracer**

   * `trace.getTracer('servicio')`
   * Esto funciona después de `sdk.start()` porque NodeSDK ya registró un `TracerProvider` global.

---

## 🔹 3️⃣ Resumen de infaltables para Node.js

| Propósito                     | Paquete                                                       | Comentario                                          |
| ----------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| API / spans manuales          | `@opentelemetry/api` ✅                                        | Siempre necesario                                   |
| SDK Node (todo en uno)        | `@opentelemetry/sdk-node` ✅                                   | Incluye provider, span processors y registro global |
| SpanProcessors / Exporters    | `@opentelemetry/sdk-trace-base` ✅                             | Para control manual de exporters/procesamiento      |
| Instrumentations automáticas  | `@opentelemetry/auto-instrumentations-node`                   | Opcional, depende si querés spans automáticos       |
| Instrumentations individuales | `@opentelemetry/instrumentation-http`, `-express`, `-mongodb` | Alternativa a auto-instrumentations                 |

---

💡 **Patrón mental para cualquier proyecto Node.js**

```
[ Decide: Manual / Automático ]
          │
          ▼
 [ Tracer / Spans manuales o Instrumentations automáticas ]
          │
          ▼
 [ SpanProcessor ]
          │
          ▼
 [ Exporter(s) → destino ]
```

* Lo **infaltable mínimo** para Node.js server:

  * `@opentelemetry/api` + `@opentelemetry/sdk-node` + un exporter (Console/OTLP/etc.)
  * Instrumentations = opcional según si querés spans automáticos.

--- 

---

---

---  

# 🟢 OpenTelemetry Node.js – Panorama completo

## 1️⃣ **Trazas (Tracing)**

### **Nivel 1 – Trace / Instrumentation**

* **Función**: crea los spans que forman un trace (flujo de una operación).
* **Opciones**:

#### Manual (Tracer)

* `@opentelemetry/api`

  * `trace.getTracer(name)` → devuelve un tracer para crear spans manuales.
* Ejemplo: `tracer.startSpan("mi-span")`

#### Automático (Instrumentation)

* **Meta-paquete**

  * `@opentelemetry/auto-instrumentations-node` → incluye instrumentaciones populares Node.js
* **Instrumentaciones individuales**

  * `@opentelemetry/instrumentation-http` → HTTP requests
  * `@opentelemetry/instrumentation-express` → Express
  * `@opentelemetry/instrumentation-mongodb` → MongoDB
  * `@opentelemetry/instrumentation-redis` → Redis
  * `@opentelemetry/instrumentation-graphql` → GraphQL
  * `@opentelemetry/instrumentation-kafkajs` → Kafka
  * `@opentelemetry/instrumentation-grpc` → gRPC
  * …y muchas más según librerías que uses

> Nota: Instrumentations normalmente se usan **automáticamente**, pero podés combinar manual y automático según necesidad.

---

### **Nivel 2 – SpanProcessor**

* **Función**: procesa los spans antes de enviarlos a un Exporter.
* **Opciones (Node.js)**:

  * `SimpleSpanProcessor` (envía cada span inmediatamente)
  * `BatchSpanProcessor` (agrupa spans y los envía por lotes, más eficiente para producción)
* **Paquete**: `@opentelemetry/sdk-trace-base`

> NodeSDK permite pasar directamente un `traceExporter`, y internamente crea un BatchSpanProcessor si no pasás uno manual.

---

### **Nivel 3 – Exporter**

* **Función**: envía spans a un destino final.
* **Opciones principales**:

| Exporter            | Paquete                                             | Destino                                      |
| ------------------- | --------------------------------------------------- | -------------------------------------------- |
| ConsoleSpanExporter | `@opentelemetry/sdk-trace-base`                     | Consola (dev / debug)                        |
| OTLPTraceExporter   | `@opentelemetry/exporter-trace-otlp-http` / `-grpc` | Collector OTLP (Grafana Tempo, Jaeger, etc.) |
| JaegerExporter      | `@opentelemetry/exporter-jaeger`                    | Jaeger                                       |
| ZipkinExporter      | `@opentelemetry/exporter-zipkin`                    | Zipkin                                       |
| CustomExporter      | `@opentelemetry/sdk-trace-base`                     | Podés enviar a cualquier backend propio      |

* Pueden usarse **varios exporters al mismo tiempo**, cada uno con su propio SpanProcessor si querés control.

---

## 2️⃣ **Métricas (Metrics)**

### **Nivel 1 – Instrumentación / Medidores**

* **Función**: crea métricas automáticamente o manualmente.
* **Opciones**:

#### Manual

* `@opentelemetry/api` → `metrics.getMeter("mi-servicio")`
* Crear instrumentos:

  * `Counter`
  * `Histogram`
  * `Gauge`

#### Automático (Instrumentations)

* `@opentelemetry/auto-instrumentations-node` (algunas instrumentaciones generan métricas)
* Instrumentaciones individuales que soporten métricas (HTTP, DB, Redis, etc.)

---

### **Nivel 2 – Exporter / Collector**

* **Función**: envía métricas a un backend
* **Opciones principales**:

| Exporter              | Paquete                                            | Destino                               |
| --------------------- | -------------------------------------------------- | ------------------------------------- |
| ConsoleMetricExporter | `@opentelemetry/sdk-metrics`                       | Consola                               |
| PrometheusExporter    | `@opentelemetry/exporter-prometheus`               | Prometheus                            |
| OTLPMetricExporter    | `@opentelemetry/exporter-metrics-otlp-http` / grpc | OTLP Collector (Tempo, Grafana, etc.) |
| CustomExporter        | SDK metrics                                        | Backend propio                        |

* Como con trazas, pueden existir múltiples exporters al mismo tiempo.

---

### 🔹 **Patrón resumido – Trazas vs Métricas**

```
TRACES
 ├─ Trace / Tracer / Instrumentation → crea spans
 ├─ SpanProcessor → procesa spans antes de exportar
 └─ Exporter → envía spans a backend (Jaeger, OTLP, Console, etc.)

METRICS
 ├─ Meter / Instrument / Instrumentation → crea métricas
 └─ Exporter → envía métricas a backend (Prometheus, OTLP, Console)
```
 