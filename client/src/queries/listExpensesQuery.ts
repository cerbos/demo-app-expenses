import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

export const listExpensesQuery = () => {
  const { user } = useAuth();
  return useQuery(
    [user.id, "expenses"],
    (): Promise<IExpense[]> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/expenses`, {
          headers: {
            Authorization: user.id,
          },
        })
        .then((res) => {
          return res.data;
        })
  );
};
