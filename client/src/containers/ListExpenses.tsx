import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Table,
  Text,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { ListAction } from "../components/ListActions";
import { StatusBadge } from "../components/StatusBadge";
import { listExpensesQuery } from "../queries/listExpensesQuery";

export const ListExpensesContainer: React.FC = () => {
  const { isLoading, error, data, refetch } = listExpensesQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <Container size="lg" px="lg">
      <Group grow>
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/">
            Home
          </Anchor>
          <Anchor component={Link} to="/expenses">
            Expenses
          </Anchor>
        </Breadcrumbs>
        <Group position="right">
          <Button compact component={Link} to="/expenses/new">
            Submit New
          </Button>
        </Group>
      </Group>
      <Paper shadow="xs" p="md">
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((e) => {
              return (
                <tr key={e.id}>
                  <td>{e.ownerId}</td>
                  <td>{new Date(e.createdAt).toLocaleString()}</td>
                  <td>{e.vendor}</td>
                  <td>
                    {`$ ${e.amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>
                    <ListAction expense={e} onUpdate={() => refetch()} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {data?.length === 0 && (
          <Box p={12}>
            <Center>
              <Text size="sm">No expenses found</Text>
            </Center>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
