import { Lite as Cerbos } from "@cerbos/lite";

export const cerbosClient = new Cerbos(fetch("/policy.wasm"));
