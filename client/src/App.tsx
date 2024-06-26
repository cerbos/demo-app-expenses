import { Group, MantineProvider } from "@mantine/core";
import { AppShell } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppHeader } from "./components/AppHeader";
import { ListExpensesContainer } from "./containers/ListExpenses";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ViewExpensesContainer } from "./containers/ViewExpense";
import { EditExpensesContainer } from "./containers/EditExpense";
import { AdminContainer } from "./containers/AdminContainer";
import { ReportsContainer } from "./containers/ReportsContainer";
import { CreateExpensesContainer } from "./containers/CreateExpense";
import { StatsProvider } from "./context/StatsContext";
import { StatsPanel } from "./containers/StatsPanel";
import { AppNavBar } from "./components/AppNavBar";
import { HomeContainer } from "./containers/HomeContainer";
import { UIPermissionsProvider } from "./context/UIPermissionsContext";

import "@mantine/core/styles.css";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <StatsProvider>
        <MantineProvider>
          <Router>
            <AuthProvider>
              <UIPermissionsProvider>
                <AppShell
                  padding="lg"
                  header={{ height: 60 }}
                  navbar={{
                    width: 300,
                    breakpoint: "sm",
                  }}
                  styles={(theme) => ({
                    main: {
                      backgroundColor: theme.colors.gray[0],
                    },
                  })}
                >
                  <AppShell.Header>
                    <Group p={10} justify="space-between">
                      <AppHeader />
                    </Group>
                  </AppShell.Header>
                  <AppNavBar />
                  <AppShell.Main>
                    <Routes>
                      <Route index element={<HomeContainer />} />
                      <Route
                        path="/expenses"
                        element={<ListExpensesContainer />}
                      />
                      <Route
                        path="/expenses/:id"
                        element={<ViewExpensesContainer />}
                      />
                      <Route
                        path="/expenses/:id/edit"
                        element={<EditExpensesContainer />}
                      />
                      <Route
                        path="/expenses/new"
                        element={<CreateExpensesContainer />}
                      />
                      <Route path="/reports" element={<ReportsContainer />} />
                      <Route path="/admin" element={<AdminContainer />} />
                    </Routes>
                  </AppShell.Main>
                  <StatsPanel />
                </AppShell>
              </UIPermissionsProvider>
            </AuthProvider>
          </Router>
        </MantineProvider>
      </StatsProvider>
    </QueryClientProvider>
  );
}

export default App;
