import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: "en", name: "English", nativeName: "English" },
  { id: "es", name: "Spanish", nativeName: "Espanol" },
  { id: "fr", name: "French", nativeName: "Francais" },
  { id: "de", name: "German", nativeName: "Deutsch" },
  { id: "it", name: "Italian", nativeName: "Italiano" },
  { id: "pt", name: "Portuguese", nativeName: "Portugues" },
  { id: "zh", name: "Chinese", nativeName: "Zhongwen" },
  { id: "ja", name: "Japanese", nativeName: "Nihongo" },
  { id: "ko", name: "Korean", nativeName: "Hangugeo" },
];

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { settings, setLanguage } = useSettings();

  const handleSelectLanguage = useCallback((langId: string) => {
    setLanguage(langId);
  }, [setLanguage]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Language</ThemedText>
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
          Select Language
        </ThemedText>

        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.id}
            style={[
              styles.languageItem,
              { backgroundColor: theme.backgroundDefault },
              settings.language === lang.id && { borderColor: Colors.light.primary, borderWidth: 2 },
            ]}
            onPress={() => handleSelectLanguage(lang.id)}
          >
            <View style={styles.languageInfo}>
              <ThemedText type="h4">{lang.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {lang.nativeName}
              </ThemedText>
            </View>
            {settings.language === lang.id ? (
              <Feather name="check-circle" size={24} color={Colors.light.primary} />
            ) : (
              <Feather name="circle" size={24} color={theme.textSecondary} />
            )}
          </Pressable>
        ))}

        <View style={[styles.infoBox, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="info" size={20} color={Colors.light.primary} />
          <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
            Language preference is saved automatically. App content will use your selected language where available.
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
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  languageInfo: {
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
