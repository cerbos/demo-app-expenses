import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

interface DeleteProps {
  id: string;
  onSuccess?: Function;
  onError?: Function;
}

export const deleteExpenseMutation = ({
  id,
  onSuccess,
  onError,
}: DeleteProps) => {
  const { user } = useAuth();
  return useMutation(
    async (): Promise<IExpense> => {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_HOST}/expenses/${id}`,
        {
          headers: {
            Authorization: `${user.id}`,
          },
        }
      );
      return res.data;
    },
    {
      onSuccess: () => onSuccess && onSuccess(),
      onError: () => onError && onError(),
    }
  );
};
