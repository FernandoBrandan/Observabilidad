// load-test.js
import axios from 'axios'

const BASE_URL = 'http://localhost:3001'
const endpoints = [
    '/ping',
    '/api/todos',
    '/api/health',
    // Agrega tus endpoints aquí
]

async function generateTraffic() {
    console.log('🔄 Generando tráfico...')

    for (let i = 0; i < 50; i++) {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
        try {
            await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 })
            console.log(`✓ GET ${endpoint}`)
        } catch (e) {
            console.log(`✗ GET ${endpoint} - ${e.response?.status || 'error'}`)
        }

        // Pequeño delay entre requests
        await new Promise(r => setTimeout(r, 200))
    }

    console.log('✅ Tráfico generado!')
}

generateTraffic()