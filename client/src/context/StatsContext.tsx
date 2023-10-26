import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { users } from "./AuthContext";

type StatsProviderProps = { children: React.ReactNode };

interface StatsContext {
  stats: Stats;
  recordClientCheck: (count: number) => void;
  setServerChecks: (count: number) => void;
  reset: () => void;
}

interface Stats {
  clientChecks: number;
  serverChecks: number;
}

const StatsContext = React.createContext<StatsContext>({
  stats: {
    clientChecks: 0,
    serverChecks: 0,
  },
  recordClientCheck: () => {},
  setServerChecks: () => {},
  reset: () => {},
});

function StatsProvider({ children }: StatsProviderProps) {
  const [stats, setStats] = React.useState<Stats>({
    clientChecks: 0,
    serverChecks: 0,
  });

  return (
    <StatsContext.Provider
      value={{
        stats,
        recordClientCheck: (count) => {
          setStats((state) => {
            return { ...state, clientChecks: state.clientChecks + count };
          });
        },
        setServerChecks: (count) => {
          setStats((state) => {
            return { ...state, serverChecks: count };
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
            serverChecks: 0,
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
          setServerChecks(res.data.serverChecks);
        }),
    {
      refetchInterval: 1000,
    }
  );
  return <div />;
}

export { StatsProvider, useStats };
