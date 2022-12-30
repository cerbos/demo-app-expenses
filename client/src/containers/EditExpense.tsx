import {
  Text,
  Center,
  Container,
  Loader,
  Paper,
  Table,
  Breadcrumbs,
  Anchor,
  Button,
  TextInput,
  NumberInput,
  Radio,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cerbosClient } from "../cerbos";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../context/StatsContext";
import { IExpense } from "../interfaces/Expense";
import { IExpensePermissions } from "../interfaces/IExpensePermissions";
import { editExpenseMutation } from "../queries/editExpenseMutation";
import { getExpenseQuery } from "../queries/getExpenseQuery";

interface Props {}

export const EditExpensesContainer: React.FC<Props> = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordClientCheck } = useStats();
  const form = useForm<IExpense>({
    initialValues: {
      id: "",
      ownerId: "",
      amount: 0,
      vendor: "",
      region: "EMEA",
      createdAt: new Date().toISOString(),
      status: "OPEN",
      approvedById: "",
    },
  });
  const [perms, setPerms] = React.useState<IExpensePermissions>({
    canApprove: false,
    canDelete: false,
    canView: false,
    canViewApprover: false,
    canEdit: false,
  });

  // Get Expense
  const { isLoading, error, data } = getExpenseQuery({ id: params.id! });

  // Update Expense
  const mutation = editExpenseMutation({
    id: params.id!,
    onSuccess: () => {
      navigate("/expenses");
    },
  });

  useEffect(() => {
    if (!data) return;
    form.setValues(data);
  }, [data]);

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
          {params?.id}
        </Anchor>
        <Anchor component={Link} to={`/expenses/${params.id}/edit`}>
          Edit
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
          {data && !perms.canEdit && <p>Permission Denied</p>}
          {data && perms.canEdit && (
            <form
              onSubmit={form.onSubmit((values) => {
                mutation.mutate({
                  region: values.region,
                  amount: values.amount,
                  vendor: values.vendor,
                });
              })}
            >
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
                    <td>{data.createdAt}</td>
                  </tr>
                  <tr>
                    <td>
                      <Text align="right" weight={500} color="dimmed">
                        Vendor
                      </Text>
                    </td>
                    <td>
                      <TextInput {...form.getInputProps("vendor")} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Text align="right" weight={500} color="dimmed">
                        Amount
                      </Text>
                    </td>
                    <td>
                      <NumberInput
                        {...form.getInputProps("amount")}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        formatter={(value) =>
                          !Number.isNaN(parseFloat(value!))
                            ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : "$ "
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Text align="right" weight={500} color="dimmed">
                        Region
                      </Text>
                    </td>
                    <td>
                      <Radio.Group
                        size="sm"
                        required
                        {...form.getInputProps("region")}
                      >
                        <Radio value="EMEA" label="EMEA" />
                        <Radio value="NA" label="NA" />
                      </Radio.Group>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <Button
                        type="submit"
                        size="sm"
                        compact
                        disabled={mutation.isLoading}
                      >
                        Save
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </form>
          )}
        </>
      </Paper>
    </Container>
  );
};
