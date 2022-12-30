import { Badge, Group, Select, Text, Title } from "@mantine/core";
import { useAuth, users } from "../context/AuthContext";

export const AppHeader = () => {
  const { user, setUser } = useAuth();

  return (
    <>
      <Title order={2}>CerbFinance</Title>

      <Group>
        <Text size={"xs"}>
          Roles:{" "}
          {user.roles.map((r, i) => (
            <Badge key={i}>{r}</Badge>
          ))}
        </Text>
        <Text size={"xs"}>
          Department: <Badge>{user.attributes.department}</Badge>
        </Text>
        {user.attributes.region && (
          <Text size={"xs"}>
            Region: <Badge>{user.attributes.region}</Badge>
          </Text>
        )}

        <Select
          data={Object.keys(users)}
          value={user.id}
          required
          onChange={(user) => {
            if (!user) return;
            setUser(user);
          }}
        />
      </Group>
    </>
  );
};
