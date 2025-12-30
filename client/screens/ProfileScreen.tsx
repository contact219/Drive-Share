import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { SettingsItem } from "@/components/SettingsItem";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = useCallback(() => {
    navigation.navigate("Auth");
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const handleTerms = useCallback(() => {
    navigation.navigate("Terms");
  }, [navigation]);

  const handlePrivacy = useCallback(() => {
    navigation.navigate("Privacy");
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  }, [logout]);

  const handleComingSoon = useCallback((feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  }, []);

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + Spacing["3xl"],
              paddingBottom: tabBarHeight + Spacing.xl,
            },
          ]}
        >
          <View style={styles.guestContainer}>
            <Avatar index={0} size={100} />
            <ThemedText type="h2" style={styles.guestTitle}>
              Welcome to Rush
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.guestMessage, { color: theme.textSecondary }]}
            >
              Sign in to book vehicles, track your trips, and manage your account.
            </ThemedText>
            <Button onPress={handleLogin} style={styles.loginButton}>
              Sign In
            </Button>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar index={user?.avatarIndex || 0} size={80} />
          <View style={styles.profileInfo}>
            <ThemedText type="h2">{user?.name || "User"}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {user?.email || ""}
            </ThemedText>
            <View style={styles.ratingRow}>
              <Feather name="star" size={14} color={Colors.light.accent} />
              <ThemedText type="small" style={styles.ratingText}>
                {user?.rating?.toFixed(1) || "5.0"} rating
              </ThemedText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statsCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: Colors.light.primary }}>
              {user?.tripsCompleted || 0}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Trips
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: Colors.light.primary }}>
              {user?.rating?.toFixed(1) || "5.0"}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Rating
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: Colors.light.primary }}>
              2024
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Member Since
            </ThemedText>
          </View>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Account
        </ThemedText>

        <SettingsItem
          icon="credit-card"
          title="Payment Methods"
          subtitle="Manage your payment options"
          onPress={() => handleComingSoon("Payment Methods")}
        />
        <SettingsItem
          icon="bell"
          title="Notifications"
          subtitle="Configure alert preferences"
          onPress={() => handleComingSoon("Notifications")}
        />
        <SettingsItem
          icon="file-text"
          title="Driving License"
          subtitle="Verify your license"
          onPress={() => handleComingSoon("Driving License")}
        />

        <ThemedText type="h4" style={styles.sectionTitle}>
          Support
        </ThemedText>

        <SettingsItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help with your account"
          onPress={() => handleComingSoon("Help & Support")}
        />
        <SettingsItem
          icon="shield"
          title="Terms & Privacy"
          subtitle="Read our policies"
          onPress={() => {
            Alert.alert(
              "Terms & Privacy",
              "Choose which policy to view",
              [
                { text: "Terms of Service", onPress: handleTerms },
                { text: "Privacy Policy", onPress: handlePrivacy },
                { text: "Cancel", style: "cancel" },
              ]
            );
          }}
        />
        <SettingsItem
          icon="settings"
          title="Settings"
          subtitle="App preferences"
          onPress={handleSettings}
        />

        <View style={styles.logoutSection}>
          <SettingsItem
            icon="log-out"
            title="Log Out"
            onPress={handleLogout}
            danger
            showChevron={false}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  guestTitle: {
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  guestMessage: {
    marginTop: Spacing.sm,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  loginButton: {
    paddingHorizontal: Spacing["4xl"],
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  profileInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  ratingText: {
    fontWeight: "500",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  logoutSection: {
    marginTop: Spacing.xl,
  },
});
