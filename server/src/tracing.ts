import "dotenv/config";

import { instrumentations } from "./instrumentations"; // must be imported before OpenTelemetry

import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
} from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const exporter = new OTLPTraceExporter({
  url: process.env.OTLP_ENDPOINT,
});

const sdk = new NodeSDK({
  contextManager: new AsyncLocalStorageContextManager(),
  instrumentations,
  serviceName: "expenses-api",
  traceExporter: exporter,
});

sdk.start();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    sdk
      .shutdown()
      .catch(console.error)
      .finally(() => process.exit(0));
  });
});

export const tracer = trace.getTracer("expenses-api");
