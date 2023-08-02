import { CerbosInstrumentation } from "@cerbos/opentelemetry";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";

export const instrumentations = [
  getNodeAutoInstrumentations(),
  new CerbosInstrumentation(),
  new PrismaInstrumentation(),
];
