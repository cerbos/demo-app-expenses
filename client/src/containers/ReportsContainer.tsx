import { Container, Breadcrumbs, Anchor, Paper, Text } from "@mantine/core";

export const ReportsContainer: React.FC = () => {
  return (
    <Container size="sm" px="lg">
      <Breadcrumbs mb="lg">
        <Anchor href="/">Home</Anchor>
        <Anchor href="/reports">Reports</Anchor>
      </Breadcrumbs>
      <Paper shadow="xs" p="md">
        <Text size={"sm"} sx={{ fontStyle: "italic" }}>
          This would be the reports homepage
        </Text>
      </Paper>
    </Container>
  );
};
