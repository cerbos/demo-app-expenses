import { useQuery } from "@tanstack/react-query";
import { User } from "../context/AuthContext";
import { UIPermissions } from "../interfaces/UIPermissions";
import { cerbos } from "./cerbos.edge";
import { useStats } from "../context/StatsContext";

export const getFeaturesEdgeQuery = (user: User) => {
  const { recordClientCheck } = useStats();
  return useQuery([user.id, "features"], async (): Promise<UIPermissions> => {
    const permissions = await cerbos.checkResource({
      principal: user,
      resource: {
        kind: "features",
        id: "features",
        attributes: {},
      },
      actions: ["admin", "expenses", "reports", "tax"],
    });
    // DEMO LOG
    ["admin", "expenses", "reports", "tax"].map((action) =>
      recordClientCheck({
        ts: new Date(),
        resourceKind: "features",
        resourceId: "features",
        principalId: user.id,
        action,
        location: "client",
      })
    );

    return {
      expenses: permissions.isAllowed("expenses") || false,
      reports: permissions.isAllowed("reports") || false,
      admin: permissions.isAllowed("admin") || false,
      tax: permissions.isAllowed("tax") || false,
    };
  });
};
