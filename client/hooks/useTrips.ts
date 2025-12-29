import { useState, useEffect, useCallback } from "react";
import * as storage from "@/lib/storage";
import { Trip } from "@/types";
import { MOCK_VEHICLES, generateMockTrips } from "@/lib/mockData";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      let data = await storage.getTrips();
      if (data.length === 0) {
        data = generateMockTrips(MOCK_VEHICLES);
        await storage.setTrips(data);
      }
      setTrips(data);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const addTrip = useCallback(async (trip: Trip) => {
    await storage.addTrip(trip);
    setTrips((prev) => [...prev, trip]);
  }, []);

  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    await storage.updateTrip(tripId, updates);
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, ...updates } : t))
    );
  }, []);

  const upcomingTrips = trips.filter(
    (t) => t.status === "upcoming" || t.status === "active"
  );
  
  const pastTrips = trips.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  );

  return {
    trips,
    upcomingTrips,
    pastTrips,
    isLoading,
    addTrip,
    updateTrip,
    refresh: loadTrips,
  };
}
