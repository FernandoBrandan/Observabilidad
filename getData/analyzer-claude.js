import fs from "fs/promises"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function analyzeObservability() {
    try {
        // Buscar el archivo JSON
        const files = await fs.readdir(".")
        const obsFile = files.find(f => f.startsWith("observabilidad-"))
        if (!obsFile) {
            console.error("❌ No se encontró archivo observabilidad-*.json")
            process.exit(1)
        }

        const data = JSON.parse(await fs.readFile(obsFile, "utf-8"))

        // Crear prompt resumido
        const prompt = `
                    Eres un experto en observabilidad.
                    Analiza el siguiente JSON con datos de Tempo, Loki y Prometheus.
                    Genera un resumen estructurado con:
                    1. Métricas clave (total traces, endpoints únicos, latencias promedio y máximas)
                    2. Correlación entre logs y traces (porcentaje estimado)
                    3. Anomalías detectadas (outliers, servicios caídos, baja instrumentación)
                    4. Recomendaciones para mejorar la observabilidad.

                    Responde en formato Markdown, claro y técnico.

                    JSON:
                    ${JSON.stringify(data).slice(0, 20000)} 
                    (Si el JSON es largo, la IA lo resumirá)
                    `

        // Llamada a Claude
        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1200,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })

        // Mostrar análisis
        const analysis = response.content[0].text
        console.log("\n📊 REPORTE DE OBSERVABILIDAD (Claude)\n")
        console.log(analysis)

        // Guardar análisis como archivo
        const reportPath = `reporte-${Date.now()}.md`
        await fs.writeFile(reportPath, analysis)
        console.log(`\n📄 Reporte guardado: ${reportPath}\n`)

    } catch (err) {
        console.error("❌ Error:", err.message)
        process.exit(1)
    }
}

analyzeObservability()
