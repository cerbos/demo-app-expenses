import { Button, Group, Table } from "@mantine/core";

import { useStats } from "../context/StatsContext";

export const StatsPanel = () => {
  const { stats, reset } = useStats();

  const combined = [...stats.clientChecks, ...stats.serverChecks].sort(
    (a, b) => b.ts.getTime() - a.ts.getTime()
  );

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
        width: 900,
      }}
    >
      <Group spacing="sm" grow>
        <div>
          <b>Cerbos Authorization Checks</b>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ marginRight: 10 }}>
            <b>Client checks:</b> {stats.clientChecks.length}
          </span>
          <span style={{ marginRight: 10 }}>
            <b>Server checks:</b> {stats.serverChecks.length}
          </span>
          <Button
            compact
            color={"red"}
            onClick={() => {
              reset();
            }}
          >
            Reset
          </Button>
        </div>
      </Group>
      <div
        style={{
          overflowY: "scroll",
          height: 350,
          border: "1px solid black",
          marginTop: 10,
        }}
      >
        <Table
          withColumnBorders
          sx={{
            color: "white",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  color: "white",
                }}
              >
                Timestamp
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Location
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Principal
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Resource Kind
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Resource ID
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Action
              </th>
              <th
                style={{
                  color: "white",
                }}
              >
                Decision
              </th>
            </tr>
          </thead>
          <tbody>
            {combined.map((entry, i) => {
              return (
                <tr key={i}>
                  <td>{entry.ts.toISOString()}</td>
                  <td
                    style={{
                      backgroundColor:
                        entry.location === "server" ? "blue" : "purple",
                    }}
                  >
                    {entry.location}
                  </td>
                  <td>{entry.principalId}</td>
                  <td>{entry.resourceKind}</td>
                  <td>{entry.resourceId}</td>
                  <td>{entry.action}</td>
                  <td
                    style={{ backgroundColor: entry.allowed ? "green" : "red" }}
                  >
                    {entry.allowed ? "ALLOW" : "DENY"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
