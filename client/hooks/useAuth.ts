import { useState, useEffect, useCallback } from "react";
import * as storage from "@/lib/storage";
import { User } from "@/types";
import { getApiUrl, apiRequest } from "@/lib/query-client";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const [isAuthenticated, user] = await Promise.all([
        storage.getIsAuthenticated(),
        storage.getUser(),
      ]);
      setState({
        isAuthenticated,
        isLoading: false,
        user,
      });
    } catch (error) {
      console.error("Error checking auth:", error);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = useCallback(async (email: string, name: string, password: string): Promise<void> => {
    const url = new URL("/api/auth/register", getApiUrl());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const apiUser: ApiUser = await response.json();
    const user = transformApiUser(apiUser);

    await storage.setUser(user);
    await storage.setIsAuthenticated(true);
    setState({
      isAuthenticated: true,
      isLoading: false,
      user,
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const url = new URL("/api/auth/login", getApiUrl());
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const apiUser: ApiUser = await response.json();
    const user = transformApiUser(apiUser);

    await storage.setUser(user);
    await storage.setIsAuthenticated(true);
    setState({
      isAuthenticated: true,
      isLoading: false,
      user,
    });
  }, []);

  const logout = useCallback(async () => {
    await storage.clearUser();
    await storage.setIsAuthenticated(false);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      await storage.setUser(updatedUser);
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    }
  }, [state.user]);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refresh: checkAuth,
  };
}
