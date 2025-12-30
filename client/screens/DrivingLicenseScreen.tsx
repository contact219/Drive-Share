import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function DrivingLicenseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  const handleUploadLicense = useCallback(() => {
    Alert.alert(
      "Upload License",
      "In a production app, this would open the camera or photo library to capture your driving license for verification.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Simulate Upload",
          onPress: () => {
            setTimeout(() => {
              setIsVerified(true);
              Alert.alert("Success", "Your driving license has been verified!");
            }, 1500);
          },
        },
      ]
    );
  }, []);

  const handleRemoveLicense = useCallback(() => {
    Alert.alert(
      "Remove License",
      "Are you sure you want to remove your driving license?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setIsVerified(false),
        },
      ]
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Driving License</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: isVerified ? Colors.light.success + "20" : Colors.light.accent + "20" },
            ]}
          >
            <Feather
              name={isVerified ? "check-circle" : "alert-circle"}
              size={32}
              color={isVerified ? Colors.light.success : Colors.light.accent}
            />
          </View>
          <ThemedText type="h4" style={styles.statusTitle}>
            {isVerified ? "License Verified" : "License Not Verified"}
          </ThemedText>
          <ThemedText type="body" style={[styles.statusText, { color: theme.textSecondary }]}>
            {isVerified
              ? "Your driving license has been verified and you can book vehicles."
              : "Please upload your driving license to book vehicles."}
          </ThemedText>
        </View>

        {isVerified ? (
          <View style={[styles.licenseCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.licenseHeader}>
              <ThemedText type="h4">License Details</ThemedText>
              <View style={[styles.verifiedBadge, { backgroundColor: Colors.light.success }]}>
                <Feather name="check" size={12} color="#fff" />
                <ThemedText type="small" style={{ color: "#fff", marginLeft: 4 }}>Verified</ThemedText>
              </View>
            </View>

            <View style={styles.licenseInfo}>
              <View style={styles.licenseRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Name</ThemedText>
                <ThemedText type="body">{user?.name || "John Doe"}</ThemedText>
              </View>
              <View style={styles.licenseRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>License Number</ThemedText>
                <ThemedText type="body">DL-1234567890</ThemedText>
              </View>
              <View style={styles.licenseRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Expiry Date</ThemedText>
                <ThemedText type="body">Dec 2028</ThemedText>
              </View>
              <View style={styles.licenseRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>State</ThemedText>
                <ThemedText type="body">California</ThemedText>
              </View>
            </View>

            <Button
              onPress={handleRemoveLicense}
              style={styles.removeButton}
            >
              Remove License
            </Button>
          </View>
        ) : (
          <>
            <View style={[styles.infoBox, { backgroundColor: Colors.light.primary + "15" }]}>
              <Feather name="info" size={20} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <ThemedText type="h4">Why verify your license?</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                  A verified license is required to book and drive vehicles. We verify your license to ensure the safety of our community.
                </ThemedText>
              </View>
            </View>

            <ThemedText type="h4" style={styles.sectionTitle}>
              Requirements
            </ThemedText>

            <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="check-circle" size={20} color={Colors.light.success} />
              <ThemedText type="body" style={styles.requirementText}>
                Valid government-issued driver's license
              </ThemedText>
            </View>
            <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="check-circle" size={20} color={Colors.light.success} />
              <ThemedText type="body" style={styles.requirementText}>
                License must not be expired
              </ThemedText>
            </View>
            <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="check-circle" size={20} color={Colors.light.success} />
              <ThemedText type="body" style={styles.requirementText}>
                Clear photo of front and back
              </ThemedText>
            </View>

            <Button
              onPress={handleUploadLicense}
              style={styles.uploadButton}
            >
              Upload License
            </Button>
          </>
        )}
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
    paddingTop: Spacing.lg,
  },
  statusCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statusTitle: {
    marginBottom: Spacing.xs,
  },
  statusText: {
    textAlign: "center",
  },
  licenseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  licenseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  licenseInfo: {
    gap: Spacing.md,
  },
  licenseRow: {
    gap: Spacing.xs,
  },
  removeButton: {
    marginTop: Spacing.xl,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  requirementText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  uploadButton: {
    marginTop: Spacing.xl,
  },
});
