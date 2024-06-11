import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

interface CreateProps {
  onSuccess?: (data: IExpense) => void;
  onError?: Function;
}

interface CreateParams {
  amount: number;
  vendor: string;
  region: string;
}

export const createExpenseMutation = ({ onError, onSuccess }: CreateProps) => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: CreateParams): Promise<IExpense> => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_HOST}/expenses`,
        data,
        {
          headers: {
            Authorization: `${user.id}`,
          },
        }
      );
      return res.data;
    },
    onSuccess(data, variables, context) {
      onSuccess && onSuccess(data);
    },
    onError: () => onError && onError(),
  });
};
