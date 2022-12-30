import {
  Text,
  Container,
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
import { useAuth } from "../context/AuthContext";
import { IExpense } from "../interfaces/Expense";
import { createExpenseMutation } from "../queries/createExpenseMutation";

interface Props {}

export const CreateExpensesContainer: React.FC<Props> = () => {
  const params = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createMutation = createExpenseMutation({
    onSuccess: (data) => {
      navigate(`/expenses/${data.id}`, { replace: true });
    },
  });
  const form = useForm<IExpense>({
    initialValues: {
      id: "",
      ownerId: user.id,
      amount: 0,
      vendor: "",
      region: user.attributes.region || "EMEA",
      createdAt: new Date().toISOString(),
      status: "OPEN",
    },
    validate: {
      vendor: (value) => (value ? undefined : "Vendor is required"),
      amount: (value) => (value ? undefined : "Amount is required"),
    },
  });

  useEffect(() => {
    form.setFieldValue("ownerId", user.id);
    form.setFieldValue("region", user.attributes.region || "EMEA");
  }, [user]);

  return (
    <Container size="sm" px="lg">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/">
          Home
        </Anchor>
        <Anchor component={Link} to="/expenses">
          Expenses
        </Anchor>
        <Anchor component={Link} to={`/expenses/new`}>
          New
        </Anchor>
      </Breadcrumbs>
      <Paper shadow="xs" p="md">
        <>
          <form
            onSubmit={form.onSubmit((values) => {
              createMutation.mutate({
                vendor: values.vendor,
                amount: values.amount,
                region: values.region,
              });
            })}
          >
            <Table>
              <tbody>
                <tr>
                  <td>
                    <Text align="right" weight={500} color="dimmed">
                      Submitted By
                    </Text>
                  </td>
                  <td>
                    <TextInput
                      readOnly
                      disabled
                      {...form.getInputProps("ownerId")}
                    />
                  </td>
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
                      Amount ($)
                    </Text>
                  </td>
                  <td>
                    <NumberInput {...form.getInputProps("amount")} />
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
                    <Button type="submit" size="sm" compact>
                      Save
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </form>
        </>
      </Paper>
    </Container>
  );
};
