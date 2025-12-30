import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SettingsItem } from "@/components/SettingsItem";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { clearAllData } from "@/lib/storage";
import { Spacing } from "@/constants/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { logout, user } = useAuth();

  const handleComingSoon = useCallback((feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      "Clear App Data",
      "This will remove all your local data including favorites and trips. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Success", "All app data has been cleared.");
          },
        },
      ]
    );
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "This will permanently delete your account and all associated data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete",
                  style: "destructive",
                  onPress: async () => {
                    await clearAllData();
                    logout();
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [logout, navigation]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Preferences
        </ThemedText>

        <SettingsItem
          icon="moon"
          title="Appearance"
          subtitle="System default"
          onPress={() => handleComingSoon("Appearance settings")}
        />
        <SettingsItem
          icon="globe"
          title="Language"
          value="English"
          onPress={() => handleComingSoon("Language settings")}
        />
        <SettingsItem
          icon="map-pin"
          title="Default Location"
          subtitle="San Francisco, CA"
          onPress={() => handleComingSoon("Location settings")}
        />

        <ThemedText type="h4" style={styles.sectionTitle}>
          About
        </ThemedText>

        <SettingsItem
          icon="info"
          title="App Version"
          value="1.0.0"
          showChevron={false}
          onPress={() => {}}
        />
        <SettingsItem
          icon="star"
          title="Rate Rush"
          subtitle="Love the app? Leave a review!"
          onPress={() => handleComingSoon("App Store rating")}
        />
        <SettingsItem
          icon="share-2"
          title="Share Rush"
          subtitle="Invite friends to join"
          onPress={() => handleComingSoon("Share feature")}
        />

        <ThemedText type="h4" style={styles.sectionTitle}>
          Data & Privacy
        </ThemedText>

        <SettingsItem
          icon="file-text"
          title="Terms of Service"
          subtitle="Read our terms"
          onPress={() => navigation.navigate("Terms")}
        />
        <SettingsItem
          icon="shield"
          title="Privacy Policy"
          subtitle="How we protect your data"
          onPress={() => navigation.navigate("Privacy")}
        />
        <SettingsItem
          icon="download"
          title="Download My Data"
          subtitle="Get a copy of your data"
          onPress={() => handleComingSoon("Data download")}
        />
        <SettingsItem
          icon="trash-2"
          title="Clear App Data"
          subtitle="Remove all local data"
          onPress={handleClearData}
        />

        {user ? (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Account
            </ThemedText>
            <SettingsItem
              icon="user-x"
              title="Delete Account"
              subtitle="Permanently remove your account"
              onPress={handleDeleteAccount}
              danger
            />
          </>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
});
