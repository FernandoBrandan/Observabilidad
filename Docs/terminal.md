docker run -d \
  --name mongo-auth \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret123 \
  mongo:latest

docker exec -it mongo-auth mongosh -u admin -p secret123 --authenticationDatabase admin

curl http://localhost:3000/todo

Perfecto, Fer. Vamos a armarte una **guía paso a paso para levantar tu stack completo y validar que todo funciona**: trazas en Tempo, métricas en Prometheus y logs en Loki/Grafana. Esto asume que ya tenés los `docker-compose.yml` y todos los archivos de configuración que armamos antes.

---

## 1️⃣ Levantar Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

* `-d` levanta los contenedores en segundo plano.
* Contenedores principales que vas a ver:

```
otel-collector   (puertos 4317/4318/9464)
tempo            (puerto 3200, OTLP 4317)
loki             (puerto 3100)
prometheus       (puerto 9090)
grafana          (puerto 3000)
```

Verifica que todos estén corriendo:

```bash
docker-compose ps
```

---

## 2️⃣ Verificar puertos

* Grafana: [http://localhost:3000](http://localhost:3000)
* Prometheus: [http://localhost:9090](http://localhost:9090)
* Tempo: [http://localhost:3200](http://localhost:3200)
* Loki: se consulta desde Grafana.

---

## 3️⃣ Preparar tu app Node.js

Asegurate de tener `tracing.ts` importado en tu `index.ts`:

```ts
import "./tracing";
```

Y que tu aplicación levante un endpoint HTTP simple, por ejemplo:

```ts
import express from "express";
import logger from "./logger";

const app = express();

app.get("/ping", (req, res) => {
  logger.info("Ping recibido");
  res.send("pong");
});

app.listen(3001, () => console.log("App corriendo en puerto 3001"));
```

---

## 4️⃣ Realizar peticiones para generar datos

Esto va a generar **trazas, métricas y logs**.

```bash
# 1. Pings simples
curl http://localhost:3001/ping
curl http://localhost:3001/ping
curl http://localhost:3001/ping
```

* Cada petición genera un **span en OpenTelemetry** → exportado a Tempo.
* Genera **métrica HTTP request duration** → Prometheus.
* Genera **log con traceId** → Winston → stdout o archivo → Promtail → Loki.

Si querés, podes hacer un pequeño loop para más tráfico:

```bash
for i in {1..20}; do curl http://localhost:3001/ping; done
```

---

## 5️⃣ Verificar métricas en Prometheus

1. Entrá a [http://localhost:9090](http://localhost:9090)
2. Buscá la métrica `http_server_duration_seconds` u otra de tu instrumentación.
3. Debe mostrar los valores de tus requests recientes.

---

## 6️⃣ Verificar trazas en Tempo

1. Entrá a [http://localhost:3200](http://localhost:3200)
2. Seleccioná tu servicio (`todo-service`)
3. Debes ver **spans generados por las peticiones /ping**.
4. Si querés correlación con logs, recordá que los traceId se imprimen en tus logs de Winston.

---

## 7️⃣ Verificar logs en Grafana (Loki)

1. Entrá a [http://localhost:3000](http://localhost:3000)
2. Añadí un panel de **Explore** → seleccioná **Loki** como datasource.
3. Query de prueba:

```
{job="todo-service"}
```

Deberías ver todos los logs de Winston con traceId, timestamp y level.

---

## 8️⃣ Tips de verificación rápida

* **Si no ves spans en Tempo** → revisá el endpoint del OTLPTraceExporter (`OTLP_ENDPOINT`). Debe apuntar al Collector o directamente a Tempo si tu tempo soporta OTLP.
* **Si no ves métricas en Prometheus** → revisá que el Collector exporte Prometheus en `0.0.0.0:9464` y que Prometheus scrapee ese puerto.
* **Si no ves logs en Loki** → revisá que Promtail lea correctamente los logs (archivo o stdout) y que el job tenga las etiquetas correctas.

---

Con esto ya tenés un **ciclo completo de observabilidad local**, operativo para:

* Logs → Loki
* Métricas → Prometheus
* Trazas → Tempo

---

Si querés, puedo armarte un **script bash de prueba** que haga varias peticiones y valide automáticamente que:

1. Hay spans en Tempo
2. Métricas en Prometheus
3. Logs en Loki

Sería como un **smoke test completo de observabilidad**.

¿Querés que haga eso?


 