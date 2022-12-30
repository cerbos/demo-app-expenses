export interface IExpense {
  id: string;
  ownerId: string;
  createdAt: string;
  vendor: string;
  region: "EMEA" | "NA",
  amount: number;
  status: "OPEN" | "APPROVED" | "REJECTED";
  approvedById?: string;
}
