import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  roles: string[];
  isAuthenticated: boolean;
  setAuth: (token: string, username: string, roles: string[]) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,
        username: null,
        roles: [],
        isAuthenticated: false,
        setAuth: (token, username, roles) =>
          set({
            token,
            username,
            roles,
            isAuthenticated: true,
          }),
        clearAuth: () =>
          set({
            token: null,
            username: null,
            roles: [],
            isAuthenticated: false,
          }),
        isAdmin: () => get().roles.includes("admin"),
      }),
      { name: "war-room-auth" },
    ),
    { name: "war-room-auth" },
  ),
);

/** Map War Room server role to persisted auth roles */
export function rolesFromWarRoomRole(role: "super" | "guest"): string[] {
  return role === "super" ? ["admin", "super"] : ["guest"];
}
