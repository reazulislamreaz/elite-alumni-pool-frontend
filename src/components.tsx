import { Navigate, Outlet } from "react-router-dom";
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

export const Card = ({ title, value }: { title: string; value: number | string }) => (
  <div className="card">
    <p>{title}</p>
    <h3>{value}</h3>
  </div>
);
