import 'dotenv/config'

import { instrumentations } from './instrumentations' // must be imported before OpenTelemetry

import { diag, DiagConsoleLogger, DiagLogLevel, trace } from '@opentelemetry/api'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { NodeSDK } from '@opentelemetry/sdk-node'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

const sdk = new NodeSDK({
  contextManager: new AsyncLocalStorageContextManager(),
  instrumentations,
  serviceName: 'expenses-api',
})

sdk.start();

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    sdk.shutdown().catch(console.error).finally(() => process.exit(0))
  })
});

export const tracer = trace.getTracer('expenses-api')
