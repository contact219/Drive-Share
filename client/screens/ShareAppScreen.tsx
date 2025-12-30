import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const SHARE_OPTIONS = [
  { id: "message", icon: "message-square", title: "Message", color: "#25D366" },
  { id: "email", icon: "mail", title: "Email", color: "#EA4335" },
  { id: "copy", icon: "copy", title: "Copy Link", color: "#6B7280" },
  { id: "more", icon: "share-2", title: "More", color: "#3B82F6" },
];

export default function ShareAppScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const shareLink = "https://rush.app/download";
  const shareMessage = "Check out Rush - the best way to rent vehicles on-demand! Use my referral code RUSH2024 for $10 off your first trip.";

  const handleShare = useCallback(async (method: string) => {
    try {
      if (method === "copy") {
        Alert.alert("Link Copied", "The download link has been copied to your clipboard.");
        return;
      }

      const result = await Share.share({
        message: shareMessage,
        url: shareLink,
        title: "Share Rush",
      });

      if (result.action === Share.sharedAction) {
        Alert.alert("Thanks for Sharing!", "You'll earn $10 credit when your friend completes their first trip.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to share at this time.");
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Share Rush</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: Colors.light.primary }]}>
          <Feather name="gift" size={48} color="#fff" />
          <ThemedText type="h3" style={styles.heroTitle}>
            Give $10, Get $10
          </ThemedText>
          <ThemedText type="body" style={styles.heroText}>
            Share Rush with friends and you both get $10 credit towards your next trip!
          </ThemedText>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Your Referral Code
        </ThemedText>

        <View style={[styles.codeCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: Colors.light.primary }}>
            RUSH2024
          </ThemedText>
          <Pressable
            style={[styles.copyButton, { backgroundColor: Colors.light.primary + "20" }]}
            onPress={() => handleShare("copy")}
          >
            <Feather name="copy" size={16} color={Colors.light.primary} />
            <ThemedText type="small" style={{ color: Colors.light.primary, marginLeft: 4 }}>
              Copy
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Share Via
        </ThemedText>

        <View style={styles.shareGrid}>
          {SHARE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.shareOption, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => handleShare(option.id)}
            >
              <View style={[styles.shareIcon, { backgroundColor: option.color + "20" }]}>
                <Feather name={option.icon as any} size={24} color={option.color} />
              </View>
              <ThemedText type="small">{option.title}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.statsTitle}>Your Referral Stats</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: Colors.light.primary }}>3</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Friends Invited</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: Colors.light.primary }}>$20</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Credits Earned</ThemedText>
            </View>
          </View>
        </View>

        <Button
          onPress={() => handleShare("more")}
          style={styles.shareButton}
        >
          Share Now
        </Button>
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
  heroCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    color: "#fff",
    marginTop: Spacing.md,
  },
  heroText: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  codeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  shareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  shareOption: {
    width: "22%",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  statsTitle: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  shareButton: {
    marginTop: Spacing.md,
  },
});
