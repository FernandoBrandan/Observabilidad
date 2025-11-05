# 🧭 Ruta de Aprendizaje OpenTelemetry + Node.js

**Stack objetivo:** Winston (logs) + Prom-Client (métricas) + OpenTelemetry (trazas) + Prometheus + Tempo + Grafana

---

## 🎯 Guía Rápida de Uso

**Si sos principiante:** Seguí el orden exacto 1→14  
**Si ya conocés observabilidad:** Empezá en Nivel 3 (recurso #5)  
**Si querés ir directo a código:** Nivel 5 (#10, #11, #12)  
**Si vas a producción:** Nivel 4 completo (#8, #9)

---

## 🟢 **Nivel 1 — Fundamentos y Primeros Pasos**
**Objetivo:** Entender qué es OpenTelemetry y hacer tu primera instrumentación

### [Get Started with OpenTelemetry Node - Practical Guide](https://dev.to/aspecto/get-started-with-opentelemetry-node-a-practical-guide-for-devs-380g)
- 🎓 **Por qué empezar acá:** Tutorial hands-on paso a paso. Código simple, perfecto para principiantes.
- ⏱️ **Tiempo estimado:** 1-2 horas
- 🛠️ **Qué aprenderás:** Instrumentar tu primera app, crear spans, exportar trazas

- <mark> Nota: obsoleto, sdkNode y auto-instrumentations-node comprime paquetes. exporter-jaeger en desuso

---

## 🟡 **Nivel 2 — Introducción al Tracing Distribuido**
**Objetivo:** Comprender la teoría de trazas, spans y correlación entre servicios

### 3️⃣ [Intro to Distributed Tracing (Tempo + OpenTelemetry + Grafana)](https://grafana.com/blog/2021/09/23/intro-to-distributed-tracing-with-tempo-opentelemetry-and-grafana-cloud/)
- 🎓 **Por qué:** Explica conceptos fundamentales: spans, traces, relaciones padre-hijo, propagación de contexto
- ⏱️ **Tiempo estimado:** 2 horas
- 🛠️ **Qué aprenderás:** Arquitectura de tracing, cómo se correlacionan requests entre microservicios
 
---

## 🟠 **Nivel 3 — Stack Completo de Observabilidad (Logs + Métricas + Traces)**
**Objetivo:** Integrar los 3 pilares de observabilidad en Node.js

### 5️⃣ [Supercharge Your Node.js Monitoring](https://dev.to/gleidsonleite/supercharge-your-nodejs-monitoring-with-opentelemetry-prometheus-and-grafana-4mhd)
- 🎓 **Por qué:** Combina OpenTelemetry (trazas) + Prometheus (métricas) + Grafana (visualización)
- ⏱️ **Tiempo estimado:** 3-4 horas
- 🛠️ **Qué aprenderás:** Integrar métricas con trazas, correlacionar datos en Grafana

- <mark> Nota: tiene ejemplo de span manual 

### 7️⃣ [Monitoring Polyglot Microservices (Python + NodeJS + Go)](https://dev.to/uptrace/monitoring-polyglot-microservices-python-nodejs-and-go-with-opentelemetry-32lf)
- 🎓 **Por qué:** Arquitectura multi-lenguaje. Aprende patterns de trazabilidad entre servicios heterogéneos
- ⏱️ **Tiempo estimado:** 3 horas
- 🛠️ **Qué aprenderás:** Context propagation entre lenguajes, baggage, semantic conventions

---
---
--- 

### 9️⃣ [Lessons from OpenTelemetry Collector - Serie Completa](https://dev.to/tomjohnson3)
- **[Part 1](https://dev.to/tomjohnson3/lessons-from-working-with-the-opentelemetry-collector-part-1-3c25):** Pipelines, receivers, processors, exporters
- **[Part 2](https://dev.to/tomjohnson3/lessons-from-working-with-the-opentelemetry-collector-part-2-500l):** Configuraciones avanzadas, troubleshooting, performance
- **[Part 3](https://dev.to/tomjohnson3/lessons-from-working-with-the-opentelemetry-collector-part-3-551l):** Casos edge, sampling strategies, arquitecturas distribuidas

- 🎓 **Por qué:** Lecciones del mundo real en producción. Fundamental para escalar
- ⏱️ **Tiempo estimado:** 1-2 días (3 artículos profundos)
- 🛠️ **Qué aprenderás:** Collector en producción, optimización, debugging

---

## 🔵 **Nivel 5 — Proyectos Prácticos con Docker Compose**
**Objetivo:** Experimentar con stacks completos listos para usar

### 🔟 [nodejs-opentelemetry-tempo (GitHub - ⭐ RECOMENDADO)](https://github.com/mnadeem/nodejs-opentelemetry-tempo)
- 🎓 **Por qué:** Proyecto completo con docker-compose. Incluye microservicios Node.js, DB, Prometheus, Loki, Tempo, Grafana
- ⏱️ **Tiempo estimado:** 2-4 horas (setup + exploración)
- 🛠️ **Qué aprenderás:** Stack completo funcionando, configuración real, dashboards pre-configurados
- 💡 **TIP:** Usa este proyecto como laboratorio para probar todo lo aprendido

### 1️⃣1️⃣ [Tracetest con Grafana Tempo y Node.js](https://docs.tracetest.io/examples-tutorials/recipes/running-tracetest-with-tempo)
- 🎓 **Por qué:** Testing basado en trazas. Valida que tus traces sean correctos en CI/CD
- ⏱️ **Tiempo estimado:** 2-3 horas
- 🛠️ **Qué aprenderás:** Test-driven observability, assertions sobre spans, integración CI/CD

### 1️⃣2️⃣ [Hands-on OpenTelemetry (Python + NodeJS)](https://felipetrindade.com/opentelemetry-hands-on/)
- 🎓 **Por qué:** Proyecto mixto con FastAPI (Python) y Express (Node.js). Ve cómo se comunican servicios en diferentes lenguajes
- ⏱️ **Tiempo estimado:** 3-4 horas
- 🛠️ **Qué aprenderás:** Interoperabilidad, trace propagation entre lenguajes, service mesh patterns

---

## 📊 Tabla Resumen de Progresión

| Nivel | Tema Principal | Recursos | Tiempo Total | Habilidad Adquirida |
|-------|---------------|----------|--------------|---------------------|
| 🟢 **1** | Primeros pasos | #1, #2 | 2-3 horas | Instrumentación básica |
| 🟡 **2** | Teoría de tracing | #3, #4 | 4-5 horas | Arquitectura de trazas |
| 🟠 **3** | Logs + Métricas + Traces | #5, #6, #7 | 2-3 días | Stack completo integrado |
| 🟣 **4** | Collector y Producción | #8, #9 | 2-3 días | Arquitectura enterprise |
| 🔵 **5** | Proyectos reales | #10, #11, #12 | 1-2 días | Experiencia práctica |

**Tiempo total estimado:** 2-3 semanas (dedicando 2-3 horas diarias)

---

## 🗓️ Plan de Estudio Sugerido

### **Semana 1: Fundamentos**
- **Día 1-2:** Nivel 1 (#1, #2) → Primera app instrumentada
- **Día 3-4:** Nivel 2 (#3, #4) → Teoría + conceptos
- **Día 5-7:** Clonar proyecto #10, explorarlo, romperlo, arreglarlo

### **Semana 2: Integración**
- **Día 1-3:** Nivel 3 (#5, #6) → Métricas + Trazas + Logs
- **Día 4-5:** Nivel 3 (#7) → Polyglot microservices
- **Día 6-7:** Implementar Winston + Prom-Client + OpenTelemetry en tu proyecto

### **Semana 3: Producción**
- **Día 1-3:** Nivel 4 (#8, #9) → Collector profundo
- **Día 4-5:** Nivel 5 (#11, #12) → Testing + multi-lenguaje
- **Día 6-7:** Refinar tu implementación con lo aprendido

---

## 🎯 Checklist de Hitos

- [ ] ✅ **Hito 1:** Instrumentar una app Express con OpenTelemetry y ver trazas en consola
- [ ] ✅ **Hito 2:** Exportar trazas a Tempo y visualizarlas en Grafana
- [ ] ✅ **Hito 3:** Integrar Prometheus y crear tu primer dashboard con métricas + trazas
- [ ] ✅ **Hito 4:** Agregar Winston y correlacionar logs con trace_id en Grafana
- [ ] ✅ **Hito 5:** Levantar el stack completo del proyecto #10 sin errores
- [ ] ✅ **Hito 6:** Configurar OpenTelemetry Collector con tus propios processors
- [ ] ✅ **Hito 7:** Implementar sampling strategies en producción
- [ ] ✅ **Hito 8:** Crear tests automatizados basados en trazas (Tracetest)

---

## 💡 Tips de Aprendizaje

1. **No leas todo de corrido:** Alterna lectura → código → experimento
2. **Mantén el proyecto #10 corriendo:** Usalo como sandbox para probar configs
3. **Documenta tus hallazgos:** Crea tu propio README con comandos útiles
4. **Únete a la comunidad:** [CNCF Slack - #opentelemetry](https://cloud-native.slack.com/)
5. **Contribuí:** Una vez que domines el tema, mejora la documentación o ejemplos

---

## 🚀 Siguiente Paso

**Acción inmediata:** Clona el proyecto #10 (`nodejs-opentelemetry-tempo`) y ejecuta:
```bash
git clone https://github.com/mnadeem/nodejs-opentelemetry-tempo
cd nodejs-opentelemetry-tempo
docker-compose up
```

Luego abrí:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

Y empezá a explorar cómo se relacionan los dashboards con el código.

---

**¿Dudas, feedback o querés profundizar algo específico?** 🤔