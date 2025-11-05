import { context, trace } from "@opentelemetry/api";

export function getCurrentTraceId() {
    const span = trace.getSpan(context.active());
    return span ? span.spanContext().traceId : undefined;
}
