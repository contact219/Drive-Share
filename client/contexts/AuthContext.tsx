import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as storage from "@/lib/storage";
import { User } from "@/types";
import { getApiUrl } from "@/lib/query-client";

interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarIndex: number;
  rating: string;
  tripsCompleted: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

function transformApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    avatarIndex: apiUser.avatarIndex,
    rating: parseFloat(apiUser.rating),
    tripsCompleted: apiUser.tripsCompleted,
    memberSince: new Date(apiUser.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  socialLogin: (provider: string, token: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const [authenticated, storedUser] = await Promise.all([
        storage.getIsAuthenticated(),
        storage.getUser(),
      ]);
      setIsAuthenticated(authenticated);
      setUser(storedUser);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function handleAuthResponse(response: Response): Promise<User> {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Authentication failed");
    }

    const body = await response.json();
    const apiUser: ApiUser = body.user ?? body;
    const token: string | undefined = body.token;

    const transformedUser = transformApiUser(apiUser);

    await Promise.all([
      storage.setUser(transformedUser),
      storage.setIsAuthenticated(true),
      token ? storage.setAuthToken(token) : Promise.resolve(),
    ]);

    setUser(transformedUser);
    setIsAuthenticated(true);
    return transformedUser;
  }

  const register = useCallback(async (email: string, name: string, password: string): Promise<void> => {
    const url = new URL("/api/auth/register", getApiUrl());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    await handleAuthResponse(response);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const url = new URL("/api/auth/login", getApiUrl());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    await handleAuthResponse(response);
  }, []);

  const socialLogin = useCallback(async (provider: string, token: string, name?: string): Promise<void> => {
    const url = new URL("/api/auth/social", getApiUrl());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, token, name }),
    });
    await handleAuthResponse(response);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      storage.clearUser(),
      storage.setIsAuthenticated(false),
      storage.clearAuthToken(),
    ]);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await storage.setUser(updatedUser);
      setUser(updatedUser);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        socialLogin,
        logout,
        updateUser,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
