import {
  Container,
  Breadcrumbs,
  Anchor,
  Paper,
  Grid,
  Card,
  Text,
  Group,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useUIPermissions } from "../context/UIPermissionsContext";

export const HomeContainer: React.FC = () => {
  const perms = useUIPermissions();
  return (
    <Container px="lg">
      <Breadcrumbs mb="lg">
        <Anchor href="/">Home</Anchor>
      </Breadcrumbs>
      <Grid>
        <Grid.Col span={4}>
          <Card p="xl" component={Link} to="/expenses">
            <Group>
              <Text fw={500}>Expenses</Text>
              <IconArrowRight size={15} />
            </Group>
            <Text size="sm" color="dimmed">
              Submit and manage expenses
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          {perms.reports && (
            <Card p="xl" component={Link} to="/reports">
              <Group>
                <Text fw={500}>Reports</Text>
                <IconArrowRight size={15} />
              </Group>
              <Text size="sm" color="dimmed">
                Reports for the management team
              </Text>
            </Card>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {perms.admin && (
            <Card p="xl" component={Link} to="/admin">
              <Group>
                <Text fw={500}>Admin</Text>
                <IconArrowRight size={15} />
              </Group>
              <Text size="sm" color="dimmed">
                System and user management
              </Text>
            </Card>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};
