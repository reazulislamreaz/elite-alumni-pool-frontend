import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { setToken } from "./api";
import { ProtectedRoute, ShellNav, roleLabel } from "./components";
import { DashboardPage, LoginPage, NotificationsPage, ProjectsPage, SignupPage, TasksPage, TeamPage } from "./pages";
import { hydrateAuth, useAuthStore } from "./store";

const Shell = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);

  return (
    <div className={`appShell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">Elite Pool</div>
          <p className="brandTag">Project collaboration</p>
        </div>
        <ShellNav />
        <div className="sidebarFooter">
          <div className="userMeta">
            <span className="userName">{user?.name}</span>
            <span className="userRole">{roleLabel(user?.role)}</span>
          </div>
          <div className="sidebarActions">
            <button type="button" className="btnGhost" onClick={toggleTheme}>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            <button type="button" className="btnDanger" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="mainArea">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    hydrateAuth();
    const token = localStorage.getItem("token");
    if (token) setToken(token);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<Shell />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
