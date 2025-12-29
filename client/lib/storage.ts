import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Trip, FilterOptions } from "@/types";

const STORAGE_KEYS = {
  USER: "@rush_user",
  FAVORITES: "@rush_favorites",
  TRIPS: "@rush_trips",
  FILTERS: "@rush_filters",
  IS_AUTHENTICATED: "@rush_is_authenticated",
};

export async function getUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function setUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user:", error);
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  } catch (error) {
    console.error("Error clearing user:", error);
  }
}

export async function getFavorites(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}

export async function setFavorites(favorites: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error setting favorites:", error);
  }
}

export async function addFavorite(vehicleId: string): Promise<void> {
  const favorites = await getFavorites();
  if (!favorites.includes(vehicleId)) {
    favorites.push(vehicleId);
    await setFavorites(favorites);
  }
}

export async function removeFavorite(vehicleId: string): Promise<void> {
  const favorites = await getFavorites();
  const updated = favorites.filter((id) => id !== vehicleId);
  await setFavorites(updated);
}

export async function isFavorite(vehicleId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(vehicleId);
}

export async function getTrips(): Promise<Trip[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRIPS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting trips:", error);
    return [];
  }
}

export async function setTrips(trips: Trip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  } catch (error) {
    console.error("Error setting trips:", error);
  }
}

export async function addTrip(trip: Trip): Promise<void> {
  const trips = await getTrips();
  trips.push(trip);
  await setTrips(trips);
}

export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
  const trips = await getTrips();
  const index = trips.findIndex((t) => t.id === tripId);
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updates };
    await setTrips(trips);
  }
}

export async function getFilters(): Promise<FilterOptions | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting filters:", error);
    return null;
  }
}

export async function setFilters(filters: FilterOptions): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error("Error setting filters:", error);
  }
}

export async function clearFilters(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.FILTERS);
  } catch (error) {
    console.error("Error clearing filters:", error);
  }
}

export async function getIsAuthenticated(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return data === "true";
  } catch (error) {
    console.error("Error getting auth status:", error);
    return false;
  }
}

export async function setIsAuthenticated(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, value ? "true" : "false");
  } catch (error) {
    console.error("Error setting auth status:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error("Error clearing all data:", error);
  }
}
