import { create } from "zustand";
import { setToken } from "./api";

type Role = "Admin" | "ProjectManager" | "TeamMember";
type User = { id: string; name: string; email: string; role: Role };

interface AuthState {
  token?: string;
  user?: User;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  setAuth: (token, user) =>
    set(() => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      return { token, user };
    }),
  logout: () =>
    set(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(undefined);
      return { token: undefined, user: undefined };
    }),
}));

export const hydrateAuth = () => {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  if (token && rawUser) useAuthStore.getState().setAuth(token, JSON.parse(rawUser));
};
