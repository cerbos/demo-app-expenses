import { GRPC as Cerbos } from "@cerbos/grpc";
// Local PDP
export const cerbos = new Cerbos(process.env.CERBOS_HOST || "localhost:3593", {
  tls: false,
});
