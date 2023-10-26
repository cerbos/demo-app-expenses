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
    recordClientCheck(3);
    return {
      expenses: permissions.isAllowed("expenses") || false,
      reports: permissions.isAllowed("reports") || false,
      admin: permissions.isAllowed("admin") || false,
      tax: permissions.isAllowed("tax") || false,
    };
  });
};
