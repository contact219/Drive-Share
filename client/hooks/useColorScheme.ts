import { useColorScheme as useRNColorScheme } from "react-native";
import { useSettings } from "@/contexts/SettingsContext";

export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  try {
    const { settings } = useSettings();
    if (settings.theme === "light") return "light";
    if (settings.theme === "dark") return "dark";
    return systemScheme ?? "light";
  } catch {
    return systemScheme ?? "light";
  }
}
