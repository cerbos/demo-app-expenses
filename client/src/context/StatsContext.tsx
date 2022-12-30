import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { users } from "./AuthContext";

type StatsProviderProps = { children: React.ReactNode };

interface StatsContext {
  stats: Stats;
  recordClientCheck: () => void;
  reset: () => void;
}

interface Stats {
  clientChecks: number;
  serverCalls: number;
}

const StatsContext = React.createContext<StatsContext>({
  stats: {
    clientChecks: 0,
    serverCalls: 0,
  },
  recordClientCheck: () => {},
  reset: () => {},
});

function StatsProvider({ children }: StatsProviderProps) {
  const [stats, setStats] = React.useState<Stats>({
    clientChecks: 0,
    serverCalls: 0,
  });

  useQuery(
    ["stats"],
    (): Promise<{ serverChecks: number }> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/_/usage`, {
          headers: {
            Authorization: users.ian.id,
          },
        })
        .then((res) => {
          setStats({
            ...stats,
            serverCalls: res.data.serverChecks,
          });
          return res.data;
        }),
    {
      refetchInterval: 1000,
    }
  );

  return (
    <StatsContext.Provider
      value={{
        stats,
        recordClientCheck: () => {
          setStats((state) => {
            return { ...state, clientChecks: state.clientChecks + 1 };
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
            clientChecks: 0,
            serverCalls: 0,
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

export { StatsProvider, useStats };
