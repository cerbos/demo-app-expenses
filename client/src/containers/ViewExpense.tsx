import {
  Text,
  Center,
  Container,
  Loader,
  Paper,
  Table,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";

import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cerbosClient } from "../cerbos";
import { ListAction } from "../components/ListActions";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../context/StatsContext";
import { IExpensePermissions } from "../interfaces/IExpensePermissions";
import { getExpenseQuery } from "../queries/getExpenseQuery";

interface Props {}

export const ViewExpensesContainer: React.FC<Props> = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordClientCheck } = useStats();

  const [perms, setPerms] = React.useState<IExpensePermissions>({
    canApprove: false,
    canDelete: false,
    canView: false,
    canViewApprover: false,
    canEdit: false,
  });

  // Get Expense
  const { isLoading, error, data, refetch } = getExpenseQuery({
    id: params.id!,
  });

  // Check permissions
  React.useEffect(() => {
    const fetchPerms = async () => {
      if (!data) return;
      const decision = await cerbosClient.checkResource({
        principal: user,
        resource: {
          kind: "expense",
          id: data.id,
          attributes: {
            ...data,
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
  }, [user, data]);

  return (
    <Container size="sm" px="lg">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/">
          Home
        </Anchor>
        <Anchor component={Link} to="/expenses">
          Expenses
        </Anchor>
        <Anchor component={Link} to={`/expenses/${params.id}`}>
          {data?.id}
        </Anchor>
      </Breadcrumbs>
      <Paper shadow="xs" p="md">
        <>
          {isLoading && (
            <Center>
              <Loader />
            </Center>
          )}

          {error && <p>Permission Denied</p>}
          {data && !perms.canView && <p>Permission Denied</p>}

          {data && perms.canView && (
            <Table>
              <tbody>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      ID
                    </Text>
                  </td>
                  <td>{data.id}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Submitted By
                    </Text>
                  </td>
                  <td>{data.ownerId}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Submitted At
                    </Text>
                  </td>
                  <td>{new Date(data.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Vendor
                    </Text>
                  </td>
                  <td>{data.vendor}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Amount
                    </Text>
                  </td>
                  <td>
                    {`$ ${data.amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Region
                    </Text>
                  </td>
                  <td>{data.region}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Status
                    </Text>
                  </td>
                  <td>
                    <StatusBadge status={data.status} />
                  </td>
                </tr>
                {perms.canViewApprover && (
                  <tr>
                    <td>
                      <Text align="right" weight={500} color="dimmed">
                        Approved By
                      </Text>
                    </td>
                    <td>{data.approvedById}</td>
                  </tr>
                )}
                <tr>
                  <td></td>
                  <td>
                    <ListAction
                      expense={data}
                      hideDetails
                      onDelete={() => {
                        navigate(`/expenses`, { replace: true });
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </>
      </Paper>
    </Container>
  );
};
