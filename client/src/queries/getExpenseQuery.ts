import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

export const getExpenseQuery = ({ id }: { id: string }) => {
  const { user } = useAuth();
  return useQuery(
    [user.id, "expenses", id],
    (): Promise<IExpense> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/expenses/${id}`, {
          headers: {
            Authorization: user.id,
          },
        })
        .then((res) => {
          return res.data;
        })
  );
};
