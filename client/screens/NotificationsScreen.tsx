import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "push",
      title: "Push Notifications",
      description: "Receive alerts on your device",
      enabled: true,
    },
    {
      id: "booking",
      title: "Booking Updates",
      description: "Get notified about your trip status",
      enabled: true,
    },
    {
      id: "reminders",
      title: "Trip Reminders",
      description: "Reminders before your trip starts",
      enabled: true,
    },
    {
      id: "promotions",
      title: "Promotions & Offers",
      description: "Special deals and discounts",
      enabled: false,
    },
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive updates via email",
      enabled: true,
    },
    {
      id: "sms",
      title: "SMS Alerts",
      description: "Important alerts via text message",
      enabled: false,
    },
  ]);

  const toggleSetting = useCallback((id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Notifications</ThemedText>
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
          Alert Preferences
        </ThemedText>

        {settings.map((setting) => (
          <View
            key={setting.id}
            style={[styles.settingItem, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.settingInfo}>
              <ThemedText type="h4">{setting.title}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {setting.description}
              </ThemedText>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => toggleSetting(setting.id)}
              trackColor={{ false: theme.textSecondary, true: Colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={[styles.infoBox, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="info" size={20} color={Colors.light.primary} />
          <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
            You can also manage notification permissions in your device settings.
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
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
