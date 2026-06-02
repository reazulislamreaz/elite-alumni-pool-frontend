import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store";

export const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleGate = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !roles.includes(role)) return null;
  return <>{children}</>;
};

export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <header className="pageHeader">
    <div>
      <h1 className="pageTitle">{title}</h1>
      {subtitle ? <p className="pageSubtitle">{subtitle}</p> : null}
    </div>
  </header>
);

export const Card = ({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "danger";
}) => (
  <div className={`kpiCard kpiCard--${tone}`}>
    <span className="kpiLabel">{title}</span>
    <strong className="kpiValue">{value}</strong>
  </div>
);

export const Badge = ({ children, variant = "neutral" }: { children: React.ReactNode; variant?: string }) => (
  <span className={`badge badge--${variant}`}>{children}</span>
);

export const ShellNav = () => (
  <nav className="sidebarNav">
    {[
      { to: "/", label: "Dashboard", icon: "◉" },
      { to: "/projects", label: "Projects", icon: "▣" },
      { to: "/tasks", label: "Tasks", icon: "☑" },
      { to: "/team", label: "Team", icon: "◎" },
      { to: "/notifications", label: "Notifications", icon: "◈" },
    ].map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        className={({ isActive }) => `navItem${isActive ? " navItem--active" : ""}`}
      >
        <span className="navIcon" aria-hidden>
          {item.icon}
        </span>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export const roleLabel = (role?: string) => {
  if (role === "ProjectManager") return "Manager";
  if (role === "TeamMember") return "Team Member";
  return role || "User";
};
