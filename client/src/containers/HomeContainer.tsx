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
          <Card
            p="xl"
            component={Link}
            to="/expenses"
            sx={(theme) => ({
              boxShadow: theme.shadows.xs,
              "&:hover": {
                boxShadow: theme.shadows.sm,
              },
              "&:active": {
                backgroundColor: theme.colors.gray[1],
              },
            })}
          >
            <Group>
              <Text weight={500}>Expenses</Text>
              <IconArrowRight size={15} />
            </Group>
            <Text size="sm" color="dimmed">
              Submit and manage expenses
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          {perms.reports && (
            <Card
              p="xl"
              component={Link}
              to="/reports"
              sx={(theme) => ({
                boxShadow: theme.shadows.xs,
                "&:hover": {
                  boxShadow: theme.shadows.sm,
                },
                "&:active": {
                  backgroundColor: theme.colors.gray[1],
                },
              })}
            >
              <Group>
                <Text weight={500}>Reports</Text>
                <IconArrowRight size={15} />
              </Group>
              <Text size="sm" color="dimmed">
                Reports for the management team
              </Text>
            </Card>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {perms.tax && (
            <Card
              p="xl"
              component={Link}
              to="/tax"
              sx={(theme) => ({
                boxShadow: theme.shadows.xs,
                "&:hover": {
                  boxShadow: theme.shadows.sm,
                },
                "&:active": {
                  backgroundColor: theme.colors.gray[1],
                },
              })}
            >
              <Group>
                <Text weight={500}>Tax</Text>
                <IconArrowRight size={15} />
              </Group>
              <Text size="sm" color="dimmed">
                Tax reporting for Finance team
              </Text>
            </Card>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {perms.admin && (
            <Card
              p="xl"
              component={Link}
              to="/admin"
              sx={(theme) => ({
                boxShadow: theme.shadows.xs,
                "&:hover": {
                  boxShadow: theme.shadows.sm,
                },
                "&:active": {
                  backgroundColor: theme.colors.gray[1],
                },
              })}
            >
              <Group>
                <Text weight={500}>Admin</Text>
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
