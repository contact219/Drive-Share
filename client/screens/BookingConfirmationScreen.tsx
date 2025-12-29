import React, { useMemo, useCallback, useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTrips } from "@/hooks/useTrips";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getVehicleById } from "@/lib/mockData";
import { Trip } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "BookingConfirmation">;

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { addTrip } = useTrips();

  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const vehicle = useMemo(() => {
    return getVehicleById(route.params.vehicleId);
  }, [route.params.vehicleId]);

  const startDate = new Date(route.params.startDate);
  const endDate = new Date(route.params.endDate);

  const duration = useMemo(() => {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60)));
  }, [startDate, endDate]);

  const subtotal = vehicle ? duration * vehicle.pricePerHour : 0;
  const serviceFee = subtotal * 0.1;
  const totalCost = subtotal + serviceFee;

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleConfirm = useCallback(async () => {
    if (!agreedToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions to continue.");
      return;
    }

    if (!vehicle) return;

    setIsLoading(true);

    try {
      const newTrip: Trip = {
        id: `trip_${Date.now()}`,
        vehicleId: vehicle.id,
        vehicle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "upcoming",
        totalCost,
        pickupLocation: vehicle.location.address,
        createdAt: new Date().toISOString(),
      };

      await addTrip(newTrip);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Booking Confirmed!",
        `Your ${vehicle.name} is booked for ${formatDateTime(startDate)}. You'll receive a confirmation notification.`,
        [
          {
            text: "View My Trips",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Main",
                      state: {
                        routes: [{ name: "Trips" }],
                        index: 1,
                      },
                    },
                  ],
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [agreedToTerms, vehicle, startDate, endDate, totalCost, addTrip, navigation]);

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="h2">Vehicle not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.vehicleCard, { backgroundColor: theme.backgroundDefault }]}>
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.vehicleImage}
            contentFit="cover"
          />
          <View style={styles.vehicleInfo}>
            <ThemedText type="h4">{vehicle.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          Trip Details
        </ThemedText>

        <View style={[styles.detailsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="play-circle" size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Start
              </ThemedText>
              <ThemedText type="body">{formatDateTime(startDate)}</ThemedText>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="stop-circle" size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                End
              </ThemedText>
              <ThemedText type="body">{formatDateTime(endDate)}</ThemedText>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="map-pin" size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Pickup Location
              </ThemedText>
              <ThemedText type="body">{vehicle.location.address}</ThemedText>
            </View>
          </View>
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          Cost Breakdown
        </ThemedText>

        <View style={[styles.costCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.costRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              ${vehicle.pricePerHour} x {duration} hour{duration !== 1 ? "s" : ""}
            </ThemedText>
            <ThemedText type="body">${subtotal.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.costRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Service fee
            </ThemedText>
            <ThemedText type="body">${serviceFee.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.costDivider} />
          <View style={styles.costRow}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="h3" style={{ color: Colors.light.primary }}>
              ${totalCost.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.paymentCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="credit-card" size={24} color={Colors.light.primary} />
          <View style={styles.paymentContent}>
            <ThemedText type="body">Pay at Pickup</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Payment will be collected when you start your trip
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={styles.termsRow}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: agreedToTerms
                  ? Colors.light.primary
                  : "transparent",
                borderColor: agreedToTerms
                  ? Colors.light.primary
                  : theme.textSecondary,
              },
            ]}
          >
            {agreedToTerms ? (
              <Feather name="check" size={14} color="#FFFFFF" />
            ) : null}
          </View>
          <ThemedText type="small" style={styles.termsText}>
            I agree to the rental terms and conditions, cancellation policy, and
            acknowledge that I have a valid driver's license.
          </ThemedText>
        </Pressable>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Button
          onPress={handleConfirm}
          style={styles.confirmButton}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : `Confirm & Book - $${totalCost.toFixed(2)}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  vehicleCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: Spacing.md,
    marginLeft: 40,
  },
  costCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  costDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: Spacing.sm,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  paymentContent: {
    flex: 1,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    flex: 1,
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  confirmButton: {
    width: "100%",
  },
});
