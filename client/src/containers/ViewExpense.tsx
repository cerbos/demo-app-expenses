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
import { ListAction } from "../components/ListActions";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { IExpensePermissions } from "../interfaces/IExpensePermissions";
import { getExpenseQuery } from "../queries/getExpenseQuery";

interface Props {}

export const ViewExpensesContainer: React.FC<Props> = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      setPerms(data.permissions);
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
          {data?.expense.id}
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
                  <td>{data.expense.id}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Submitted By
                    </Text>
                  </td>
                  <td>{data.expense.ownerId}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Submitted At
                    </Text>
                  </td>
                  <td>{new Date(data.expense.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Vendor
                    </Text>
                  </td>
                  <td>{data.expense.vendor}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Amount
                    </Text>
                  </td>
                  <td>
                    {`$ ${data.expense.amount}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Region
                    </Text>
                  </td>
                  <td>{data.expense.region}</td>
                </tr>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Status
                    </Text>
                  </td>
                  <td>
                    <StatusBadge status={data.expense.status} />
                  </td>
                </tr>
                {perms.canViewApprover && (
                  <tr>
                    <td>
                      <Text align="right" weight={500} color="dimmed">
                        Approved By
                      </Text>
                    </td>
                    <td>{data.expense.approvedById}</td>
                  </tr>
                )}
                <tr>
                  <td></td>
                  <td>
                    <ListAction
                      expense={data.expense}
                      hideDetails
                      permissions={data.permissions}
                      onDelete={() => {
                        navigate(`/expenses`, { replace: true });
                      }}
                      onUpdate={() => {
                        refetch();
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
