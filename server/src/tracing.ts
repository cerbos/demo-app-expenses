import { instrumentations } from './instrumentations' // must be imported first

import {
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import * as api from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

const contextManager = new AsyncHooksContextManager().enable()

api.context.setGlobalContextManager(contextManager)

// Configure the trace provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'expenses-api',
  }),
})

const exporter = new OTLPTraceExporter({ url: `http://${process.env.OLTP_COLLECTOR}` });

provider.addSpanProcessor(new SimpleSpanProcessor(exporter))


// Register the provider globally
provider.register();
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});

// Register your auto-instrumentors
registerInstrumentations({
  tracerProvider: provider,
  instrumentations,
})

export const tracer = api.trace.getTracer('expenses-api');
