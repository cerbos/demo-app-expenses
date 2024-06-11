import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpenseResponse } from "../interfaces/Expense";

export const getExpenseQuery = ({ id }: { id: string }) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [user.id, "expenses", id],
    queryFn: (): Promise<IExpenseResponse> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/expenses/${id}`, {
          headers: {
            Authorization: user.id,
          },
        })
        .then((res) => {
          return res.data;
        }),
  });
};
