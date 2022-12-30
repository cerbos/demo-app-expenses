import { Container, Breadcrumbs, Anchor, Paper, Text } from "@mantine/core";

export const AdminContainer: React.FC = () => {
  return (
    <Container size="sm" px="lg">
      <Breadcrumbs mb="lg">
        <Anchor href="/">Home</Anchor>
        <Anchor href="/admin">Admin</Anchor>
      </Breadcrumbs>
      <Paper shadow="xs" p="md">
        <Text size={"sm"} sx={{ fontStyle: "italic" }}>
          This would be the admin homepage
        </Text>
      </Paper>
    </Container>
  );
};
