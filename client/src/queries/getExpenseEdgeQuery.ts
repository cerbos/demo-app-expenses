import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense, IExpenseResponse } from "../interfaces/Expense";
import { cerbos } from "./cerbos.edge";
import { useStats } from "../context/StatsContext";

export const getExpenseEdgeQuery = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const { recordClientCheck } = useStats();
  return useQuery(
    [user.id, "expenses", id],
    async (): Promise<IExpenseResponse> => {
      const { data } = await axios.get<{
        expense: IExpense;
        permissions: { canViewApprover: boolean };
      }>(`${import.meta.env.VITE_API_HOST}/expenses/${id}`, {
        headers: {
          Authorization: user.id,
        },
      });

      const permissions = await cerbos.checkResource({
        principal: user,
        resource: {
          id: data.expense.id,
          kind: "expense",
          attr: JSON.parse(JSON.stringify(data.expense)),
        },
        actions: ["edit", "delete", "approve"],
      });
      // DEMO LOG
      ["edit", "delete", "approve"].map((action) =>
        recordClientCheck({
          ts: new Date(),
          resourceKind: "expense",
          resourceId: data.expense.id,
          principalId: user.id,
          action,
          location: "client",
        })
      );

      return {
        expense: data.expense,
        permissions: {
          canView: true,
          canViewApprover: data.permissions.canViewApprover,
          canEdit: permissions.isAllowed("edit") || false,
          canDelete: permissions.isAllowed("delete") || false,
          canApprove: permissions.isAllowed("approve") || false,
        },
      };
    }
  );
};
