import "./utils/tracing";
import express, { Request, Response, NextFunction } from 'express'
import { uploadLimiter, ordersLimiter, globalRateLimiter } from './utils/ratelimit'
import { createDynamicProxy } from './utils/proxyRoutes'
import { authenticateJWT } from './utils/auth'
import { register, httpRequestsTotal, httpRequestDuration } from "./utils/metrics";
import { getCurrentTraceId } from "./utils/tracingContext"

import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import logger from "./utils/logger";

dotenv.config()
const app = express()
// ===== Middleware global =====
app.use(cors())
app.use(helmet())
app.use(express.json())

// Trace ID - Correlation ID y logging 
app.use((req: Request, res: Response, next: NextFunction) => {
    const traceId = getCurrentTraceId();
    (req as any).traceId = traceId;
    if (traceId) res.setHeader("X-Trace-Id", traceId);

    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    (req as any).correlationId = correlationId
    res.setHeader('X-Correlation-Id', correlationId)

    // ===== Metrics =====
    // Middleware de medición
    const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
    res.on("finish", () => {
        httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
        end();
    });

    next()
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[x-correlation-id]'))
app.use(globalRateLimiter)

app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok', message: 'API Gateway running' }))

app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
}); 