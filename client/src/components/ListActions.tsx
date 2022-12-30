import { ActionIcon, Button, Group } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import React from "react";
import { useNavigate } from "react-router-dom";
import { cerbosClient } from "../cerbos";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../context/StatsContext";
import { IExpense } from "../interfaces/Expense";
import { IExpensePermissions } from "../interfaces/IExpensePermissions";
import { approveExpenseMutation } from "../queries/approveExpenseMutation";
import { deleteExpenseMutation } from "../queries/deleteExpenseMutation";

interface Props {
  expense: IExpense;
  onUpdate?: (expense: IExpense) => void;
  onDelete?: () => void;
  hideDetails?: boolean;
}

export const ListAction: React.FC<Props> = ({
  expense,
  onUpdate,
  onDelete,
  hideDetails,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recordClientCheck } = useStats();

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
    const fetchPerms = async () => {
      const decision = await cerbosClient.checkResource({
        principal: user,
        resource: {
          kind: "expense",
          id: expense.id,
          attributes: {
            ...expense,
          },
        },
        actions: ["view", "view:approver", "edit", "delete", "approve"],
      });
      recordClientCheck();
      setPerms({
        canApprove: decision.isAllowed("approve") || false,
        canDelete: decision.isAllowed("delete") || false,
        canView: decision.isAllowed("view") || false,
        canViewApprover: decision.isAllowed("view:approver") || false,
        canEdit: decision.isAllowed("edit") || false,
      });
    };

    fetchPerms();
  }, [user, expense]);

  return (
    <Group spacing="sm">
      {!hideDetails && (
        <Button
          size="xs"
          compact
          disabled={!perms.canView}
          onClick={() => {
            navigate(`/expenses/${expense.id}`);
          }}
        >
          Details
        </Button>
      )}
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
    </Group>
  );
};
