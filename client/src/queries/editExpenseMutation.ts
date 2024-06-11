import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

interface EditProps {
  id: string;
  onSuccess?: Function;
  onError?: Function;
}

interface UpdateParams {
  region: string;
  amount: number;
  vendor: string;
}

export const editExpenseMutation = ({ id, onError, onSuccess }: EditProps) => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: UpdateParams): Promise<IExpense> => {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_HOST}/expenses/${id}`,
        data,
        {
          headers: {
            Authorization: `${user.id}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => onSuccess && onSuccess(),
    onError: () => onError && onError(),
  });
};
