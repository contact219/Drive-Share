import { useState, useEffect, useCallback } from "react";
import * as storage from "@/lib/storage";
import { User } from "@/types";
import { MOCK_USER } from "@/lib/mockData";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
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

  const login = useCallback(async (email: string, name: string) => {
    const user: User = {
      ...MOCK_USER,
      id: `user_${Date.now()}`,
      email,
      name,
    };
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
    logout,
    updateUser,
    refresh: checkAuth,
  };
}
