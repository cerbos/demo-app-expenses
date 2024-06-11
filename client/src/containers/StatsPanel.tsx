import { Button, Group, Table } from "@mantine/core";

import { useStats } from "../context/StatsContext";

export const StatsPanel = () => {
  const { stats, reset } = useStats();

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 1000,
        bottom: 10,
        right: 10,
        background: "rgba(0, 0, 0, 0.5)",
        padding: 10,
        margin: 5,
        color: "white",
        borderRadius: 5,
      }}
    >
      <Table
        style={{
          color: "white",
        }}
      >
        <tbody>
          <tr>
            <td colSpan={2}>
              <b>Cerbos Authorization Checks</b>
            </td>
          </tr>
          {/* <tr>
            <td align="right">Browser:</td>
            <td>{stats.clientChecks}</td>
          </tr> */}
          <tr>
            <td align="right">Server:</td>
            <td>{stats.serverCalls}</td>
          </tr>
        </tbody>
      </Table>
      <Group justify="flex-end">
        <Button
          size="compact-sm"
          color={"red"}
          onClick={() => {
            reset();
          }}
        >
          Reset
        </Button>
      </Group>
    </div>
  );
};
