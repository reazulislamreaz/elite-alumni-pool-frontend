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

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

const initialTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme(),
  toggleTheme: () =>
    set(() => {
      const next: Theme = get().theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));

// Apply the persisted/system theme synchronously at module load so there is no
// flash of the wrong theme before React mounts.
applyTheme(useThemeStore.getState().theme);
