import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { setToken } from "./api";
import { ProtectedRoute, ShellNav, roleLabel } from "./components";
import { DashboardPage, LoginPage, NotificationsPage, ProjectsPage, SignupPage, TasksPage, TeamPage } from "./pages";
import { hydrateAuth, useAuthStore, useThemeStore } from "./store";

const ThemeToggle = () => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="btnGhost themeToggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? "☀️ Light mode" : "🌙 Dark mode"}
    </button>
  );
};

const Shell = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="brand">
            <div className="brandLogo">TF</div>
            <div>
              <div className="brandMark">TaskForge</div>
              <p className="brandTag">Project &amp; task collaboration</p>
            </div>
          </div>
          <div className="profileCard">
            <div className="userAvatar">{user?.name?.charAt(0) || "U"}</div>
            <div className="userMeta">
              <span className="userName">{user?.name}</span>
              <span className="userEmail">{user?.email}</span>
              <span className="userRole">{roleLabel(user?.role)}</span>
            </div>
          </div>
        </div>
        <div className="sidebarBody">
          <ShellNav />
          <ThemeToggle />
          <button type="button" className="btnSignOut" onClick={logout}>
            Sign out
          </button>
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
