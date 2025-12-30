import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

type ThemeOption = "system" | "light" | "dark";

interface ThemeOptionItem {
  id: ThemeOption;
  title: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOptionItem[] = [
  { id: "system", title: "System Default", icon: "smartphone" },
  { id: "light", title: "Light Mode", icon: "sun" },
  { id: "dark", title: "Dark Mode", icon: "moon" },
];

export default function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("system");

  const handleSelectTheme = useCallback((themeId: ThemeOption) => {
    setSelectedTheme(themeId);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Appearance</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Theme
        </ThemedText>

        {THEME_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.optionItem,
              { backgroundColor: theme.backgroundDefault },
              selectedTheme === option.id && { borderColor: Colors.light.primary, borderWidth: 2 },
            ]}
            onPress={() => handleSelectTheme(option.id)}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name={option.icon as any} size={20} color={Colors.light.primary} />
            </View>
            <ThemedText type="body" style={styles.optionText}>
              {option.title}
            </ThemedText>
            {selectedTheme === option.id ? (
              <Feather name="check-circle" size={24} color={Colors.light.primary} />
            ) : (
              <Feather name="circle" size={24} color={theme.textSecondary} />
            )}
          </Pressable>
        ))}

        <View style={[styles.infoBox, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="info" size={20} color={Colors.light.primary} />
          <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
            System Default will automatically switch between light and dark mode based on your device settings.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
});
