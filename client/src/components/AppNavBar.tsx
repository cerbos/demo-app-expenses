import { AppShell, NavLink } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useUIPermissions } from "../context/UIPermissionsContext";

export const AppNavBar = () => {
  const location = useLocation();

  const perms = useUIPermissions();

  return (
    <AppShell.Navbar>
      <NavLink
        label="Home"
        active={location.pathname == "/"}
        component={Link}
        to="/"
      />
      {perms.expenses && (
        <NavLink
          label="Expenses"
          active={location.pathname.startsWith("/expenses")}
          component={Link}
          to="/expenses"
        />
      )}
      {perms.reports && (
        <NavLink
          label="Reports"
          active={location.pathname.startsWith("/reports")}
          component={Link}
          to="/reports"
        />
      )}
      {perms.admin && (
        <NavLink
          label="Admin"
          active={location.pathname.startsWith("/admin")}
          component={Link}
          to="/admin"
        />
      )}
    </AppShell.Navbar>
  );
};
