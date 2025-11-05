import fs from 'fs/promises'

async function analyzeObservability() {
    try {
        // Leer el JSON (ajusta el path según tu archivo)
        const files = await fs.readdir('.')
        const obsFile = files.find(f => f.startsWith('observabilidad-'))

        if (!obsFile) {
            console.error('❌ No se encontró archivo observabilidad-*.json')
            process.exit(1)
        }

        const data = JSON.parse(await fs.readFile(obsFile, 'utf-8'))

        console.log('\n' + '='.repeat(70))
        console.log('📊 ANÁLISIS DE OBSERVABILIDAD - REPORTE COMPLETO')
        console.log('='.repeat(70) + '\n')

        // 1. ANÁLISIS DE TRACES
        console.log('🔍 TRACES (Tempo)')
        console.log('-'.repeat(70))

        const traces = data.tempo || []
        const traceStats = {
            total: traces.length,
            byEndpoint: {},
            durations: [],
            spanCounts: [],
        }

        traces.forEach(t => {
            const endpoint = t.rootTraceName || 'UNKNOWN'
            traceStats.byEndpoint[endpoint] = (traceStats.byEndpoint[endpoint] || 0) + 1
            traceStats.durations.push(t.durationMs)
            traceStats.spanCounts.push(t.spanSet?.spans?.length || 0)
        })

        console.log(`   Total de traces: ${traceStats.total}`)
        console.log(`   Endpoints únicos: ${Object.keys(traceStats.byEndpoint).length}`)
        console.log(`   \n   Distribución por endpoint:`)
        Object.entries(traceStats.byEndpoint)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([ep, count]) => {
                console.log(`      • ${ep}: ${count} traces (${((count / traceStats.total) * 100).toFixed(1)}%)`)
            })

        const avgDuration = (traceStats.durations.reduce((a, b) => a + b, 0) / traceStats.durations.length).toFixed(2)
        const maxDuration = Math.max(...traceStats.durations)
        const minDuration = Math.min(...traceStats.durations)

        console.log(`   \n   Latencias (ms):`)
        console.log(`      • Promedio: ${avgDuration}ms`)
        console.log(`      • Máximo: ${maxDuration}ms`)
        console.log(`      • Mínimo: ${minDuration}ms`)
        console.log(`      • P95: ${traceStats.durations.sort((a, b) => a - b)[Math.floor(traceStats.durations.length * 0.95)]}ms`)

        const avgSpans = (traceStats.spanCounts.reduce((a, b) => a + b, 0) / traceStats.spanCounts.length).toFixed(2)
        console.log(`   \n   Spans por trace: promedio ${avgSpans}`)

        // 2. ANÁLISIS DE LOGS
        console.log('\n📝 LOGS (Loki)')
        console.log('-'.repeat(70))

        const logsDocker = data.loki['{job="docker"}'] || []
        const logsByMessage = {}

        logsDocker.forEach(entry => {
            entry.values?.forEach(([_, logLine]) => {
                try {
                    const parsed = JSON.parse(logLine)
                    const log = JSON.parse(parsed.log)
                    const msg = log.message
                    logsByMessage[msg] = (logsByMessage[msg] || 0) + 1
                } catch (e) { }
            })
        })

        console.log(`   Total de logs: ${logsDocker.length}`)
        console.log(`   Tipos de mensajes:`)
        Object.entries(logsByMessage).forEach(([msg, count]) => {
            console.log(`      • "${msg}": ${count} logs`)
        })

        // 3. ANÁLISIS DE MÉTRICAS
        console.log('\n📈 MÉTRICAS (Prometheus)')
        console.log('-'.repeat(70))

        const prometheus = data.prometheus || {}
        console.log(`   Métricas disponibles: ${Object.keys(prometheus).length}`)
        console.log(`   \n   Estado de servicios (up):`)

        prometheus.up?.forEach(m => {
            const instance = m.metric.instance
            const job = m.metric.job
            const status = m.values?.[0]?.[1] === '1' ? '✅ UP' : '❌ DOWN'
            console.log(`      • ${job} (${instance}): ${status}`)
        })

        if (prometheus.process_resident_memory_bytes?.length > 0) {
            const mem = prometheus.process_resident_memory_bytes[0].values?.[0]?.[1]
            const memMB = (parseInt(mem) / 1024 / 1024).toFixed(2)
            console.log(`   \n   Memoria (Prometheus): ${memMB}MB`)
        }

        // 4. CORRELACIÓN TRACES-LOGS
        console.log('\n🔗 CORRELACIÓN TRACES ↔ LOGS')
        console.log('-'.repeat(70))

        const traceIdsInLogs = new Set()
        logsDocker.forEach(entry => {
            entry.values?.forEach(([_, logLine]) => {
                try {
                    const parsed = JSON.parse(logLine)
                    const log = JSON.parse(parsed.log)
                    if (log.traceId) traceIdsInLogs.add(log.traceId)
                } catch (e) { }
            })
        })

        const traceIds = new Set(traces.map(t => t.traceID))
        const correlatedTraces = [...traceIds].filter(id => traceIdsInLogs.has(id)).length

        console.log(`   Traces con logs correlacionados: ${correlatedTraces}/${traceIds.size}`)
        console.log(`   Correlación: ${((correlatedTraces / traceIds.size) * 100).toFixed(1)}%`)

        // 5. ANÁLISIS TEMPORAL
        console.log('\n⏱️  ANÁLISIS TEMPORAL')
        console.log('-'.repeat(70))

        const startTime = new Date(data.timeRange.start)
        const endTime = new Date(data.timeRange.end)
        const durationHours = (endTime - startTime) / 1000 / 3600
        const requestsPerHour = (traceStats.total / durationHours).toFixed(1)

        console.log(`   Período: ${startTime.toISOString()} a ${endTime.toISOString()}`)
        console.log(`   Duración: ${durationHours.toFixed(1)} horas`)
        console.log(`   Throughput: ${requestsPerHour} requests/hora`)

        // 6. RECOMENDACIONES
        console.log('\n💡 RECOMENDACIONES')
        console.log('-'.repeat(70))

        const recommendations = []

        if (traceStats.total < 100) {
            recommendations.push('   ⚠️  Bajo volumen de traces. Genera más tráfico para análisis significativo.')
        }

        if (Object.keys(traceStats.byEndpoint).length <= 3) {
            recommendations.push('   ⚠️  Pocos endpoints únicos. Prueba diferentes rutas de tu API.')
        }

        if (maxDuration > avgDuration * 3) {
            recommendations.push(`   ⚠️  Hay outliers: máximo es ${(maxDuration / avgDuration).toFixed(1)}x el promedio.`)
        }

        if (correlatedTraces / traceIds.size < 0.8) {
            recommendations.push('   ⚠️  Correlación traces-logs baja. Verifica instrumentación de logs.')
        }

        if (recommendations.length === 0) {
            recommendations.push('   ✅ Sistema observado correctamente. Setup en buen estado.')
        }

        recommendations.forEach(r => console.log(r))

        // 7. EXPORTAR REPORTE
        console.log('\n' + '='.repeat(70))

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTraces: traceStats.total,
                uniqueEndpoints: Object.keys(traceStats.byEndpoint).length,
                avgLatencyMs: parseFloat(avgDuration),
                maxLatencyMs: maxDuration,
                requestsPerHour: parseFloat(requestsPerHour),
                logsTotal: logsDocker.length,
                traceLogCorrelation: `${((correlatedTraces / traceIds.size) * 100).toFixed(1)}%`,
            },
            endpoints: traceStats.byEndpoint,
            traces: traces.map(t => ({
                id: t.traceID,
                endpoint: t.rootTraceName,
                durationMs: t.durationMs,
                spanCount: t.spanSet?.spans?.length,
            })),
        }

        const reportPath = `reporte-${Date.now()}.json`
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

        console.log(`📄 Reporte guardado: ${reportPath}\n`)

    } catch (err) {
        console.error('❌ Error:', err.message)
        process.exit(1)
    }
}

analyzeObservability()