import * as React from "react";
import { cerbosClient } from "../cerbos";
import { UIPermissions } from "../interfaces/UIPermissions";
import { useAuth } from "./AuthContext";
import { useStats } from "./StatsContext";

type UIPermissionsProviderProps = { children: React.ReactNode };

const UIPermissionsContext = React.createContext<UIPermissions>({
  expenses: false,
  reports: false,
  admin: false,
});

function UIPermissionsProvider({ children }: UIPermissionsProviderProps) {
  const { user } = useAuth();
  const { recordClientCheck } = useStats();

  const [perms, setPerms] = React.useState<UIPermissions>({
    expenses: false,
    reports: false,
    admin: false,
  });

  React.useEffect(() => {
    const fetchPerms = async () => {
      const decision = await cerbosClient.checkResource({
        principal: user,
        resource: {
          kind: "features",
          id: "features",
        },
        actions: ["expenses", "reports", "admin"],
      });
      recordClientCheck();
      setPerms({
        expenses: decision.isAllowed("expenses") || false,
        reports: decision.isAllowed("reports") || false,
        admin: decision.isAllowed("admin") || false,
      });
    };
    fetchPerms();
  }, [user]);

  return (
    <UIPermissionsContext.Provider value={perms}>
      {children}
    </UIPermissionsContext.Provider>
  );
}

function useUIPermissions() {
  const context = React.useContext(UIPermissionsContext);
  if (context === undefined) {
    throw new Error(
      "useUIPermissions must be used within a UIPermissionsContext"
    );
  }
  return context;
}

export { UIPermissionsProvider, useUIPermissions };
