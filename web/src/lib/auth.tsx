import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, getToken, setToken, clearToken } from "./api";

interface AuthCtx {
  user: AuthUser | null;
  signedIn: boolean;
  applyAuth: (user: AuthUser, token: string) => void;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, signedIn: false, applyAuth: () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("rush_user");
    if (raw && getToken()) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

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
