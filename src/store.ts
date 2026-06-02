import { create } from "zustand";
import { setToken } from "./api";

type Role = "Admin" | "ProjectManager" | "TeamMember";
type User = { id: string; name: string; email: string; role: Role };

interface AuthState {
  token?: string;
  user?: User;
  theme: "light" | "dark";
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  theme: "light",
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
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));

export const hydrateAuth = () => {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  if (token && rawUser) useAuthStore.getState().setAuth(token, JSON.parse(rawUser));
};
