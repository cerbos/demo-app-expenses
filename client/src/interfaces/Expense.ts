import { IExpensePermissions } from "./IExpensePermissions";

export interface IExpense {
  id: string;
  ownerId: string;
  createdAt: string;
  vendor: string;
  region: "EMEA" | "NA";
  amount: number;
  status: "OPEN" | "APPROVED" | "REJECTED";
  approvedById?: string;
}

export interface IExpenseResponse {
  expense: IExpense;
  permissions: IExpensePermissions;
}
