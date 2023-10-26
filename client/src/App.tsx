import { Group, MantineProvider } from "@mantine/core";
import { AppShell, Header } from "@mantine/core";
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
import { StatsChecker, StatsProvider } from "./context/StatsContext";
import { StatsPanel } from "./containers/StatsPanel";
import { AppNavBar } from "./components/AppNavBar";
import { HomeContainer } from "./containers/HomeContainer";
import { UIPermissionsProvider } from "./context/UIPermissionsContext";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: false,
        cacheTime: 1000 * 5, // 5 seconds
      },
    },
  });

  return (
    <StatsProvider>
      <QueryClientProvider client={queryClient}>
        <StatsChecker />
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <Router>
            <AuthProvider>
              <UIPermissionsProvider>
                <AppShell
                  padding="lg"
                  fixed={true}
                  header={
                    <Header height={60}>
                      <Group sx={{ height: "100%" }} px={20} position="apart">
                        <AppHeader />
                      </Group>
                    </Header>
                  }
                  navbar={<AppNavBar />}
                  styles={(theme) => ({
                    main: {
                      backgroundColor: theme.colors.gray[0],
                    },
                  })}
                >
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
                  <StatsPanel />
                </AppShell>
              </UIPermissionsProvider>
            </AuthProvider>
          </Router>
        </MantineProvider>
      </QueryClientProvider>
    </StatsProvider>
  );
}

export default App;
