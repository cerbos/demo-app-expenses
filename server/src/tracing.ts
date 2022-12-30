import {
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import * as api from '@opentelemetry/api'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'


const contextManager = new AsyncHooksContextManager().enable()

api.context.setGlobalContextManager(contextManager)



// Configure the trace provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'expenses-api',
  }),
})

// Configure how spans are processed and exported. In this case we're sending spans
// as we receive them to an OTLP-compatible collector (e.g. Jaeger).
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({ url: `http://${process.env.OLTP_COLLECTOR}/v1/traces`, })))


// Register your auto-instrumentors
registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [

    new PrismaInstrumentation(),
    // new GrpcInstrumentation(),
    getNodeAutoInstrumentations()
  ],
})
// Register the provider globally
provider.register()