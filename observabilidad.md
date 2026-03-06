# Observabilidad

| Elemento                      | Estado     | Notas                                          |
| ----------------------------- | ---------- | ---------------------------------------------- |
| Prometheus + Grafana          | ⚠️ Parcial | Planeado, pero aún no integrado al flujo       |
| Loki + Promtail               | ⚠️ Parcial | Instalados, falta uso real en producción       |
| Alertmanager                  | ❌          | Planeado, pero aún no configurado              |
| Logs estructurados            | ❌          | Podrías usar `pino` o `winston` en Node/NestJS |
| Tracing (jaeger, x-ray, etc.) | ❌          | Avanzado, lo podés dejar para después          |
| correlationId o contextLogger | ❌          | Importante para microservicios                 |


# 📊 3. Observabilidad / Monitoring

| Servicio			|	Descripción													| Nivel (flujo request)|
| ----------------- | ------------------------------------------------------------------------- | ------- |
| prometheus		|	Scrapea métricas de servicios/exporters									| Después |
| grafana			|	Dashboard de visualización (consume Prometheus, Loki)					| Después |
| loki				|	Recolector y almacenador de logs estructurados							| Después |
| promtail			|	Agente que lee los logs desde volumen compartido y los envía a Loki		| Después |
| alertmanager		|	Sistema de alertas basado en reglas de Prometheus						| Después |
| nginx-exporter	|	Exporta métricas de NGINX en formato Prometheus							| Después |

Todos estos están fuera del flujo directo de las requests, pero permiten observar, alertar o trazar lo que pasó antes/durante/después de una request.