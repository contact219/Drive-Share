import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OwnerProfile {
  id: string;
  userId: string;
  bio?: string;
  verificationStatus: string;
  responseRate: string;
  totalEarnings: string;
}

interface VehicleDetail {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  pricePerHour: string;
  imageUrl: string;
  seats: number;
  fuelType: string;
  transmission: string;
  locationAddress?: string;
  rating: string;
  reviewCount: number;
}

interface OwnerVehicle {
  id: string;
  vehicleId: string;
  listingStatus: string;
  instantBook: boolean;
  vehicle: VehicleDetail | null;
  verificationStatus: string | null;
  verificationNotes: string | null;
}

export default function OwnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: ownerProfile, isLoading: isLoadingProfile } = useQuery<OwnerProfile | null>({
    queryKey: ["/api/owner/profile"],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(
        new URL(`/api/owner/profile?userId=${user.id}`, getApiUrl()).toString()
      );
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  const { data: ownerVehicles = [], isLoading: isLoadingVehicles } = useQuery<OwnerVehicle[]>({
    queryKey: ["/api/owner", ownerProfile?.id, "vehicles"],
    queryFn: async () => {
      if (!ownerProfile?.id) return [];
      const response = await fetch(
        new URL(`/api/owner/${ownerProfile.id}/vehicles`, getApiUrl()).toString()
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!ownerProfile?.id,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/profile"] });
      if (ownerProfile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/owner", ownerProfile.id, "vehicles"] });
      }
    }, [queryClient, ownerProfile?.id])
  );

  const handleBecomeHost = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(new URL("/api/owner/profile", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/owner/profile"] });
      }
    } catch (error) {
      console.error("Error becoming host:", error);
    }
  }, [user?.id, queryClient]);

  const handleAddVehicle = useCallback(() => {
    navigation.navigate("AddVehicle");
  }, [navigation]);

  const getListingStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { color: Colors.light.success, label: "Active", icon: "check-circle" as const };
      case "pending":
        return { color: Colors.light.accent, label: "Pending", icon: "clock" as const };
      case "paused":
        return { color: theme.textSecondary, label: "Paused", icon: "pause-circle" as const };
      case "rejected":
        return { color: "#EF4444", label: "Rejected", icon: "x-circle" as const };
      default:
        return { color: theme.textSecondary, label: status, icon: "circle" as const };
    }
  };

  const getVerificationInfo = (status: string | null) => {
    switch (status) {
      case "approved":
        return { color: Colors.light.success, label: "Approved", icon: "check-circle" as const, message: "Your vehicle is live and available for booking." };
      case "pending":
        return { color: Colors.light.accent, label: "Under Review", icon: "clock" as const, message: "Our team is reviewing your vehicle. This usually takes 1-2 business days." };
      case "rejected":
        return { color: "#EF4444", label: "Rejected", icon: "x-circle" as const, message: "Your listing was not approved. See notes below." };
      default:
        return { color: theme.textSecondary, label: "Not Submitted", icon: "alert-circle" as const, message: "" };
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return { icon: "check-circle" as const, color: Colors.light.success, label: "Verified" };
      case "pending":
        return { icon: "clock" as const, color: Colors.light.accent, label: "Pending Review" };
      default:
        return { icon: "alert-circle" as const, color: theme.textSecondary, label: "Not Verified" };
    }
  };

  if (isLoadingProfile) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (!ownerProfile) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={styles.welcomeSection}>
            <Feather name="home" size={64} color={theme.primary} />
            <ThemedText type="h1" style={styles.welcomeTitle}>
              Become a Host
            </ThemedText>
            <ThemedText style={[styles.welcomeText, { color: theme.textSecondary }]}>
              Share your vehicle and earn extra income when you are not using it. Join thousands of hosts who are making money with Rush.
            </ThemedText>
          </View>

          <Card style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <Feather name="dollar-sign" size={24} color={Colors.light.success} />
              <View style={styles.benefitText}>
                <ThemedText type="h4">Earn Extra Income</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Set your own prices and availability
                </ThemedText>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Feather name="shield" size={24} color={Colors.light.primary} />
              <View style={styles.benefitText}>
                <ThemedText type="h4">Insurance Included</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Every trip is covered by our protection plan
                </ThemedText>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Feather name="users" size={24} color={Colors.light.secondary} />
              <View style={styles.benefitText}>
                <ThemedText type="h4">Verified Renters</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  All renters are verified before booking
                </ThemedText>
              </View>
            </View>
          </Card>

          <Button onPress={handleBecomeHost} style={styles.becomeHostButton}>
            Get Started
          </Button>
        </ScrollView>
      </ThemedView>
    );
  }

  const verification = getVerificationBadge(ownerProfile.verificationStatus);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="h1">Host Dashboard</ThemedText>
          <View style={[styles.verificationBadge, { backgroundColor: verification.color + "20" }]}>
            <Feather name={verification.icon} size={14} color={verification.color} />
            <ThemedText type="small" style={{ color: verification.color, marginLeft: 4 }}>
              {verification.label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.success }}>
              ${parseFloat(ownerProfile.totalEarnings || "0").toFixed(0)}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Earnings
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {ownerVehicles.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Vehicles
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="h2">
              {parseFloat(ownerProfile.responseRate || "100")}%
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Response Rate
            </ThemedText>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Your Vehicles</ThemedText>
          <Pressable onPress={handleAddVehicle} style={styles.addButton}>
            <Feather name="plus" size={20} color={theme.primary} />
            <ThemedText style={{ color: theme.primary, marginLeft: 4 }}>Add</ThemedText>
          </Pressable>
        </View>

        {isLoadingVehicles ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : ownerVehicles.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="truck" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No vehicles listed yet
            </ThemedText>
            <Button onPress={handleAddVehicle} style={styles.addVehicleButton}>
              List Your First Vehicle
            </Button>
          </Card>
        ) : (
          ownerVehicles.map((ov) => {
            const v = ov.vehicle;
            const listingInfo = getListingStatusInfo(ov.listingStatus);
            const verInfo = getVerificationInfo(ov.verificationStatus);
            return (
              <Card key={ov.id} style={styles.vehicleCard}>
                {v ? (
                  <Image
                    source={{ uri: v.imageUrl }}
                    style={styles.vehicleImage}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.vehicleBody}>
                  <View style={styles.vehicleTopRow}>
                    <View style={styles.vehicleNameBlock}>
                      <ThemedText type="h4" numberOfLines={1}>
                        {v ? v.name : `Vehicle #${ov.vehicleId.slice(0, 8)}`}
                      </ThemedText>
                      {v ? (
                        <ThemedText type="small" style={{ color: theme.textSecondary }}>
                          {v.year} {v.brand} {v.model}
                        </ThemedText>
                      ) : null}
                    </View>
                    {v ? (
                      <ThemedText type="h4" style={{ color: theme.primary }}>
                        ${parseFloat(v.pricePerHour).toFixed(0)}/hr
                      </ThemedText>
                    ) : null}
                  </View>

                  {v ? (
                    <View style={styles.tagRow}>
                      <View style={[styles.tag, { backgroundColor: theme.backgroundRoot }]}>
                        <ThemedText type="small" style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
                          {v.type}
                        </ThemedText>
                      </View>
                      <View style={[styles.tag, { backgroundColor: theme.backgroundRoot }]}>
                        <ThemedText type="small" style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
                          {v.transmission}
                        </ThemedText>
                      </View>
                      <View style={[styles.tag, { backgroundColor: theme.backgroundRoot }]}>
                        <Feather name="users" size={11} color={theme.textSecondary} />
                        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 3 }}>
                          {v.seats}
                        </ThemedText>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: listingInfo.color + "18" }]}>
                      <Feather name={listingInfo.icon} size={12} color={listingInfo.color} />
                      <ThemedText type="small" style={{ color: listingInfo.color, marginLeft: 4 }}>
                        {listingInfo.label}
                      </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: verInfo.color + "18" }]}>
                      <Feather name={verInfo.icon} size={12} color={verInfo.color} />
                      <ThemedText type="small" style={{ color: verInfo.color, marginLeft: 4 }}>
                        {verInfo.label}
                      </ThemedText>
                    </View>
                  </View>

                  {verInfo.message ? (
                    <View style={[styles.verificationNote, { backgroundColor: verInfo.color + "12" }]}>
                      <ThemedText type="small" style={{ color: verInfo.color }}>
                        {verInfo.message}
                      </ThemedText>
                    </View>
                  ) : null}

                  {ov.verificationNotes && ov.verificationStatus === "rejected" ? (
                    <View style={[styles.verificationNote, { backgroundColor: "#EF444418" }]}>
                      <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                        Note: {ov.verificationNotes}
                      </ThemedText>
                    </View>
                  ) : null}

                  <Pressable
                    style={[styles.manageButton, { backgroundColor: theme.primary + "15" }]}
                    onPress={() => v ? navigation.navigate("VehicleDetail", { vehicleId: v.id }) : null}
                  >
                    <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
                      View Details
                    </ThemedText>
                    <Feather name="chevron-right" size={16} color={theme.primary} />
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  welcomeText: {
    marginTop: Spacing.md,
    textAlign: "center",
    lineHeight: 22,
  },
  benefitCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  benefitText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  becomeHostButton: {
    width: "100%",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  addVehicleButton: {
    marginTop: Spacing.lg,
  },
  vehicleCard: {
    marginBottom: Spacing.md,
    overflow: "hidden",
    padding: 0,
  },
  vehicleImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  vehicleBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  vehicleTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vehicleNameBlock: {
    flex: 1,
    marginRight: Spacing.md,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  verificationNote: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
});
