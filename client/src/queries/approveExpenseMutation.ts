import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";

interface EditProps {
  id: string;
  onSuccess?: Function;
  onError?: Function;
}

interface ApproveParams {
  action: "approve" | "reject";
}

export const approveExpenseMutation = ({
  id,
  onError,
  onSuccess,
}: EditProps) => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: ApproveParams): Promise<IExpense> => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_HOST}/expenses/${id}/${data.action}`,
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
