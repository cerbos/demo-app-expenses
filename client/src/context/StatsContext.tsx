import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { users } from "./AuthContext";

type StatsProviderProps = { children: React.ReactNode };

interface CheckLog {
  ts: Date;
  location: "server" | "client";
  principalId: string;
  resourceKind: string;
  resourceId: string;
  action: string;
  allowed: boolean;
}

interface StatsContext {
  stats: Stats;
  recordClientCheck: (data: CheckLog) => void;
  setServerChecks: (data: CheckLog[]) => void;
  reset: () => void;
}

interface Stats {
  clientChecks: CheckLog[];
  serverChecks: CheckLog[];
}

const StatsContext = React.createContext<StatsContext>({
  stats: {
    clientChecks: [],
    serverChecks: [],
  },
  recordClientCheck: () => {},
  setServerChecks: () => {},
  reset: () => {},
});

function StatsProvider({ children }: StatsProviderProps) {
  const [stats, setStats] = React.useState<Stats>({
    clientChecks: [],
    serverChecks: [],
  });

  return (
    <StatsContext.Provider
      value={{
        stats,
        recordClientCheck: (data: CheckLog) => {
          setStats((state) => {
            return { ...state, clientChecks: [...state.clientChecks, data] };
          });
        },
        setServerChecks: (data) => {
          setStats((state) => {
            return { ...state, serverChecks: data };
          });
        },
        reset: () => {
          axios.post(
            `${import.meta.env.VITE_API_HOST}/_/usage/reset`,
            {},
            {
              headers: {
                Authorization: users.ian.id,
              },
            }
          );
          setStats({
            clientChecks: [],
            serverChecks: [],
          });
        },
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

function useStats() {
  const context = React.useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsContext");
  }
  return context;
}

export function StatsChecker(): React.ReactElement {
  const { setServerChecks } = useStats();
  useQuery(
    ["stats"],
    (): Promise<void> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/_/usage`, {
          headers: {
            Authorization: users.ian.id,
          },
        })
        .then((res) => {
          setServerChecks(
            (res.data.server as any[]).map((event) => {
              return {
                ...event,
                ts: new Date(event.ts),
              };
            })
          );
        }),
    {
      refetchInterval: 1000,
    }
  );
  return <div />;
}

export { StatsProvider, useStats };
