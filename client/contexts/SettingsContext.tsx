import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@rush_settings";

export type ThemePreference = "system" | "light" | "dark";

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface NotificationPrefs {
  push: boolean;
  booking: boolean;
  reminders: boolean;
  promotions: boolean;
  email: boolean;
  sms: boolean;
}

interface AppSettings {
  theme: ThemePreference;
  language: string;
  notificationPrefs: NotificationPrefs;
  savedLocations: SavedLocation[];
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  notificationPrefs: {
    push: true,
    booking: true,
    reminders: true,
    promotions: false,
    email: true,
    sms: false,
  },
  savedLocations: [],
};

interface SettingsContextType {
  settings: AppSettings;
  isLoaded: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: string) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  setSavedLocations: (locations: SavedLocation[]) => void;
  addLocation: (location: Omit<SavedLocation, "id">) => void;
  removeLocation: (id: string) => void;
  setDefaultLocation: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateAndPersist = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings(prev => {
      const updated = updater(prev);
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch(err => {
        console.error("Error saving settings:", err);
      });
      return updated;
    });
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    updateAndPersist(prev => ({ ...prev, theme }));
  }, [updateAndPersist]);

  const setLanguage = useCallback((language: string) => {
    updateAndPersist(prev => ({ ...prev, language }));
  }, [updateAndPersist]);

  const setNotificationPref = useCallback((key: keyof NotificationPrefs, value: boolean) => {
    updateAndPersist(prev => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, [key]: value },
    }));
  }, [updateAndPersist]);

  const setSavedLocations = useCallback((locations: SavedLocation[]) => {
    updateAndPersist(prev => ({ ...prev, savedLocations: locations }));
  }, [updateAndPersist]);

  const addLocation = useCallback((location: Omit<SavedLocation, "id">) => {
    updateAndPersist(prev => {
      const newLoc: SavedLocation = { ...location, id: Date.now().toString() };
      const locations = location.isDefault
        ? prev.savedLocations.map(l => ({ ...l, isDefault: false })).concat(newLoc)
        : [...prev.savedLocations, newLoc];
      return { ...prev, savedLocations: locations };
    });
  }, [updateAndPersist]);

  const removeLocation = useCallback((id: string) => {
    updateAndPersist(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.filter(l => l.id !== id),
    }));
  }, [updateAndPersist]);

  const setDefaultLocation = useCallback((id: string) => {
    updateAndPersist(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.map(l => ({ ...l, isDefault: l.id === id })),
    }));
  }, [updateAndPersist]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoaded,
        setTheme,
        setLanguage,
        setNotificationPref,
        setSavedLocations,
        addLocation,
        removeLocation,
        setDefaultLocation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
