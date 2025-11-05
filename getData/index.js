import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'

const PROMETHEUS_URL = 'http://localhost:9090/api/v1'
const TEMPO_URL = 'http://localhost:3200/api'
const LOKI_URL = 'http://localhost:3100/loki/api/v1'

// Timerange (últimas 6 horas)
const now = Math.floor(Date.now() / 1000)
const start = now - 6 * 3600
const end = now

async function getPrometheusMetrics() {
    try {
        console.log('📊 Descargando métricas de Prometheus...')

        // Lista de métricas útiles para observabilidad
        const metrics = [
            'up',
            'rate(http_requests_total[5m])',
            'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
            'process_resident_memory_bytes',
            'nodejs_heap_size_used_bytes',
            'otel_sdk_traces_traces_processed_total',
        ]

        const data = {}

        for (const metric of metrics) {
            try {
                const res = await axios.get(`${PROMETHEUS_URL}/query_range`, {
                    params: {
                        query: metric,
                        start,
                        end,
                        step: '60s',
                    },
                    timeout: 10000,
                })
                data[metric] = res.data.data?.result || []
            } catch (e) {
                console.warn(`⚠️  No se encontró métrica: ${metric}`)
                data[metric] = []
            }
        }

        return data
    } catch (err) {
        console.error('❌ Error en Prometheus:', err.message)
        return {}
    }
}

async function getTempoTraces() {
    try {
        console.log('🔍 Descargando traces de Tempo...')

        // Buscar traces sin parámetros de tiempo (dejar que Tempo use defaults)
        const searchRes = await axios.get(`${TEMPO_URL}/search`, {
            params: {
                q: '{resource.service.name="nodejs-api"}',
                limit: 100,
            },
            timeout: 10000,
        })

        const traceObjects = searchRes.data?.traces || []
        console.log(`   Encontrados ${traceObjects.length} traces`)

        // /api/search ya devuelve los objetos completos de traces
        // Solo extraer los IDs si necesitamos más detalles
        const detailedTraces = []
        for (const trace of traceObjects.slice(0, 50)) {
            // Si es un string, es el ID; si es objeto, ya tiene los datos
            if (typeof trace === 'string') {
                try {
                    const traceRes = await axios.get(`${TEMPO_URL}/traces/${trace}`, {
                        timeout: 5000,
                    })
                    detailedTraces.push(traceRes.data)
                } catch (e) {
                    console.warn(`   ⚠️  No se pudo descargar trace ${trace}`)
                }
            } else if (typeof trace === 'object') {
                // Ya es un objeto con datos
                detailedTraces.push(trace)
            }
        }

        console.log(`   Descargados ${detailedTraces.length} traces`)
        return detailedTraces
    } catch (err) {
        console.error('❌ Error en Tempo:', err.message)
        console.log('   💡 Tip: Verifica que tu app esté enviando traces a http://localhost:4318/v1/traces')
        return []
    }
}

async function getLokiLogs() {
    try {
        console.log('📝 Descargando logs de Loki...')

        const queries = [
            '{job="docker"}',
            '{container_name="node"}',
            '{container_name="otel-collector"}',
        ]

        const data = {}

        for (const query of queries) {
            try {
                const res = await axios.get(`${LOKI_URL}/query_range`, {
                    params: {
                        query,
                        start: start * 1e9, // Loki usa nanosegundos
                        end: end * 1e9,
                        limit: 1000,
                    },
                    timeout: 10000,
                })
                data[query] = res.data?.data?.result || []
            } catch (e) {
                console.warn(`⚠️  No se encontraron logs para: ${query}`)
                data[query] = []
            }
        }

        return data
    } catch (err) {
        console.error('❌ Error en Loki:', err.message)
        return {}
    }
}

async function downloadAll() {
    try {
        console.log('\n🚀 Iniciando descarga de observabilidad (últimas 6 horas)...\n')

        const [prometheus, tempo, loki] = await Promise.all([
            getPrometheusMetrics(),
            getTempoTraces(),
            getLokiLogs(),
        ])

        const bundle = {
            timestamp: new Date().toISOString(),
            timeRange: {
                start: new Date(start * 1000).toISOString(),
                end: new Date(end * 1000).toISOString(),
            },
            prometheus,
            tempo,
            loki,
        }

        // Guardar JSON
        const filename = `observabilidad-${Date.now()}.json`
        await fs.writeFile(filename, JSON.stringify(bundle, null, 2))

        console.log(`\n✅ Descarga completa!`)
        console.log(`📄 Archivo: ${filename}`)
        console.log(`📊 Métricas: ${Object.keys(prometheus).length}`)
        console.log(`🔍 Traces: ${tempo.length}`)
        console.log(`📝 Logs: ${Object.keys(loki).length} queries`)
        console.log(`💾 Tamaño: ${(JSON.stringify(bundle).length / 1024).toFixed(2)} KB\n`)

    } catch (err) {
        console.error('❌ Error fatal:', err)
        process.exit(1)
    }
}

downloadAll()