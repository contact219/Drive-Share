import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as storage from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  isFavorite: (vehicleId: string) => boolean;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const data = await storage.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (vehicleId: string) => {
    const isFav = favorites.includes(vehicleId);

    if (isFav) {
      await storage.removeFavorite(vehicleId);
      setFavorites((prev) => prev.filter((id) => id !== vehicleId));
    } else {
      await storage.addFavorite(vehicleId);
      setFavorites((prev) => [...prev, vehicleId]);
      if (Platform.OS !== "web") {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (vehicleId: string) => favorites.includes(vehicleId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        toggleFavorite,
        isFavorite,
        refresh: loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
