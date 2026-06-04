import type { ReactNode } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
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
    <h1 className="pageTitle">{title}</h1>
    {subtitle ? <p className="pageSubtitle">{subtitle}</p> : null}
  </header>
);

export const PageCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`pageCard ${className}`.trim()}>{children}</div>
);

export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <div className="emptyStateBlock">
    <div className="emptyStateIcon" aria-hidden>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 20h16M16 26h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
    <p className="emptyStateTitle">{title}</p>
    {description ? <p className="emptyStateDesc">{description}</p> : null}
  </div>
);

export const PanelTitle = ({ children }: { children: ReactNode }) => <h3 className="panelTitle">{children}</h3>;

export const ChartPanel = ({
  title,
  children,
  isEmpty,
  emptyMessage = "No data available yet",
}: {
  title: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}) => (
  <section className="panel chartPanel">
    <PanelTitle>{title}</PanelTitle>
    {isEmpty ? (
      <div className="chartPlaceholder">
        <span>{emptyMessage}</span>
      </div>
    ) : (
      children
    )}
  </section>
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

export const MemberCard = ({ name, email, role }: { name: string; email: string; role: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleKey = role === "Admin" ? "admin" : role === "ProjectManager" ? "manager" : "member";
  return (
    <article className="memberCard">
      <div className="memberCardAvatar">{initials}</div>
      <div className="memberCardBody">
        <h4 className="memberCardName">{name}</h4>
        <p className="memberCardEmail">{email}</p>
        <span className={`roleChip roleChip--${roleKey}`}>{roleLabel(role)}</span>
      </div>
    </article>
  );
};

export const NotificationItem = ({
  title,
  message,
  createdAt,
  isRead,
  onMarkRead,
}: {
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  onMarkRead?: () => void;
}) => (
  <article className={`notificationItem${isRead ? " notificationItem--read" : ""}`}>
    <div className={`notificationDot${isRead ? " notificationDot--read" : ""}`} aria-hidden />
    <div className="notificationBody">
      <h4 className="notificationTitle">{title}</h4>
      <p className="notificationMessage">{message}</p>
      <time className="notificationTime">{new Date(createdAt).toLocaleString()}</time>
    </div>
    {!isRead && onMarkRead ? (
      <button type="button" className="btnGhost btnSm" onClick={onMarkRead}>
        Mark read
      </button>
    ) : (
      <span className="badge badge--success">Read</span>
    )}
  </article>
);

export const CHART = {
  primary: "#00897b",
  secondary: "#80cbc4",
  accent: "#26a69a",
  grid: "#e5e7eb",
  axis: "#9ca3af",
} as const;

export const Badge = ({ children, variant = "neutral" }: { children: React.ReactNode; variant?: string }) => (
  <span className={`badge badge--${variant}`}>{children}</span>
);

const NavIcon = ({ name }: { name: string }) => {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    projects: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" />
      </svg>
    ),
    tasks: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    team: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.2 1.8-4 4-4" />
      </svg>
    ),
    notifications: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <span className="navIcon">{paths[name]}</span>;
};

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/projects", label: "Projects", icon: "projects" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/team", label: "Team", icon: "team" },
  { to: "/notifications", label: "Notifications", icon: "notifications" },
];

export const ShellNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/collaboration/notifications")).data,
  });
  const unread = (notifications || []).filter((n: { isRead: boolean }) => !n.isRead).length;

  return (
    <nav className="sidebarNav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={onNavigate}
          className={({ isActive }) => `navItem${isActive ? " navItem--active" : ""}`}
        >
          <NavIcon name={item.icon} />
          {item.label}
          {item.to === "/notifications" && unread > 0 ? <span className="navBadge">{unread}</span> : null}
        </NavLink>
      ))}
    </nav>
  );
};

export const roleLabel = (role?: string) => {
  if (role === "ProjectManager") return "Project Manager";
  if (role === "TeamMember") return "Team Member";
  return role || "User";
};

export const taskProgressPercent = (status: string) => {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 55;
  return 15;
};

export const TaskProgress = ({ status }: { status: string }) => {
  const pct = taskProgressPercent(status);
  return (
    <div className="progressWrap" aria-label={`Task progress ${pct}%`}>
      <div className="progressTrack">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progressLabel">{pct}%</span>
    </div>
  );
};

/* ---------- Skeleton loaders (shown while data is fetching) ---------- */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const Skeleton = ({ w, h, r }: { w?: string; h?: string; r?: string }) => (
  <span className="skeleton" style={{ width: w, height: h, borderRadius: r }} aria-hidden />
);

export const SkeletonKpis = () => (
  <div className="kpiRow" aria-hidden>
    {range(5).map((i) => (
      <div key={i} className="kpiCard">
        <Skeleton w="55%" h="11px" />
        <Skeleton w="40%" h="26px" r="6px" />
      </div>
    ))}
  </div>
);

export const SkeletonCards = ({ count = 4 }: { count?: number }) => (
  <div className="entityList" aria-hidden>
    {range(count).map((i) => (
      <div key={i} className="entityCard skeletonCard">
        <div className="skelBetween">
          <Skeleton w="38%" h="17px" />
          <Skeleton w="64px" h="18px" r="999px" />
        </div>
        <Skeleton w="72%" h="12px" />
        <div className="skelRow">
          <Skeleton w="90px" h="12px" />
          <Skeleton w="110px" h="12px" />
          <Skeleton w="80px" h="12px" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonPanels = ({ count = 4 }: { count?: number }) => (
  <div className="dashboardGrid" aria-hidden>
    {range(count).map((i) => (
      <div key={i} className="panel skeletonCard">
        <Skeleton w="45%" h="14px" />
        <Skeleton w="100%" h="180px" r="10px" />
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="skeletonList" aria-hidden>
    {range(count).map((i) => (
      <div key={i} className="skelListRow">
        <Skeleton w="60%" h="13px" />
        <Skeleton w="20%" h="11px" />
      </div>
    ))}
  </div>
);

export const SkeletonMembers = ({ count = 6 }: { count?: number }) => (
  <div className="memberGrid" aria-hidden>
    {range(count).map((i) => (
      <div key={i} className="memberCard skeletonCard">
        <Skeleton w="44px" h="44px" r="50%" />
        <div className="skelMemberBody">
          <Skeleton w="70%" h="13px" />
          <Skeleton w="90%" h="11px" />
          <Skeleton w="50%" h="16px" r="999px" />
        </div>
      </div>
    ))}
  </div>
);
