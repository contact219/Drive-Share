import { createContext, useContext, useState, ReactNode } from "react";
import { AuthUser, getToken, setToken, clearToken } from "./api";

interface AuthCtx {
  user: AuthUser | null;
  signedIn: boolean;
  applyAuth: (user: AuthUser, token: string) => void;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, signedIn: false, applyAuth: () => {}, signOut: () => {} });

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("rush_user");
    if (raw && getToken()) return JSON.parse(raw);
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise synchronously so protected routes see the signed-in state on the
  // very first render (avoids bouncing a logged-in user back to /login).
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const applyAuth = (u: AuthUser, token: string) => {
    setToken(token);
    localStorage.setItem("rush_user", JSON.stringify(u));
    setUser(u);
  };
  const signOut = () => {
    clearToken();
    localStorage.removeItem("rush_user");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, signedIn: !!user, applyAuth, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
