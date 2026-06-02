import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { setToken } from "./api";
import { ProtectedRoute } from "./components";
import { DashboardPage, LoginPage, ProjectsPage, TasksPage } from "./pages";
import { hydrateAuth, useAuthStore } from "./store";

const Shell = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  return (
    <div className={theme}>
      <header className="topbar">
        <nav className="row">
          <Link to="/">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
        <div className="row">
          <small>
            {user?.name} ({user?.role})
          </small>
          <button onClick={toggleTheme}>Theme</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
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
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<Shell />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
