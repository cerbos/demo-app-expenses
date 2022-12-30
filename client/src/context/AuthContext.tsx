import * as React from "react";

type AuthProviderProps = { children: React.ReactNode };

type User = {
  id: string;
  roles: string[];
  attributes: {
    department: string;
    region?: "EMEA" | "NA";
  };
};

export const users: { [key: string]: User } = {
  sally: {
    id: "sally",
    roles: ["USER"],
    attributes: {
      department: "SALES",
      region: "EMEA",
    },
  },
  ian: {
    id: "ian",
    roles: ["ADMIN"],
    attributes: {
      department: "IT",
    },
  },
  frank: {
    id: "frank",
    roles: ["USER"],
    attributes: {
      department: "FINANCE",
      region: "EMEA",
    },
  },
  derek: {
    id: "derek",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "FINANCE",
      region: "EMEA",
    },
  },
  simon: {
    id: "simon",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "SALES",
      region: "NA",
    },
  },
  mark: {
    id: "mark",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "SALES",
      region: "EMEA",
    },
  },
  sydney: {
    id: "sydney",
    roles: ["USER"],
    attributes: {
      department: "SALES",
      region: "NA",
    },
  },
};

const AuthContext = React.createContext<{
  user: User;
  setUser: (username: string) => void;
}>({
  user: users.sally,
  setUser(username) {},
});

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User>(
    users[window.localStorage.getItem("user") || "sally"]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: (username) => {
          setUser(users[username]);
          window.localStorage.setItem("user", username);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
