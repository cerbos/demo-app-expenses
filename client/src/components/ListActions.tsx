import { ActionIcon, Button, Group } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../context/StatsContext";
import { IExpense } from "../interfaces/Expense";
import { IExpensePermissions } from "../interfaces/IExpensePermissions";
import { approveExpenseMutation } from "../queries/approveExpenseMutation";
import { deleteExpenseMutation } from "../queries/deleteExpenseMutation";

interface Props {
  expense: IExpense;
  permissions?: IExpensePermissions;
  onUpdate?: (expense: IExpense) => void;
  onDelete?: () => void;
  hideDetails?: boolean;
}

export const ListAction: React.FC<Props> = ({
  expense,
  onUpdate,
  onDelete,
  hideDetails,
  permissions,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [perms, setPerms] = React.useState<IExpensePermissions>({
    canApprove: false,
    canDelete: false,
    canView: false,
    canViewApprover: false,
    canEdit: false,
  });

  const approveAction = approveExpenseMutation({
    id: expense.id,
    onSuccess: () => {
      onUpdate && onUpdate(expense);
    },
  });

  const deleteAction = deleteExpenseMutation({
    id: expense.id,
    onSuccess: () => {
      onDelete && onDelete();
    },
  });

  React.useEffect(() => {
    if (permissions) setPerms(permissions);
  }, [user, expense, permissions]);

  return (
    <Group spacing="sm">
      {!hideDetails && (
        <Button
          size="xs"
          compact
          onClick={() => {
            navigate(`/expenses/${expense.id}`);
          }}
        >
          Details
        </Button>
      )}
      {permissions && (
        <>
          <Button
            size="xs"
            compact
            color={"yellow"}
            disabled={!perms.canEdit}
            onClick={() => {
              navigate(`/expenses/${expense.id}/edit`);
            }}
          >
            Edit
          </Button>
          <Button
            size="xs"
            compact
            color={"green"}
            disabled={!perms.canApprove}
            onClick={() => {
              approveAction.mutate({ action: "approve" });
            }}
          >
            Approve
          </Button>
          <Button
            size="xs"
            compact
            color={"pink"}
            disabled={!perms.canApprove}
            onClick={() => {
              approveAction.mutate({ action: "reject" });
            }}
          >
            Reject
          </Button>
          <ActionIcon
            disabled={!perms.canDelete}
            color="red"
            variant="filled"
            onClick={() => {
              deleteAction.mutate();
            }}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </>
      )}
    </Group>
  );
};
