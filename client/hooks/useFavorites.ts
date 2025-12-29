import { useState, useEffect, useCallback } from "react";
import * as storage from "@/lib/storage";
import * as Haptics from "expo-haptics";

export function useFavorites() {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (vehicleId: string) => favorites.includes(vehicleId),
    [favorites]
  );

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
}
