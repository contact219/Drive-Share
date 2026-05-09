import React, { useCallback, useState, useMemo } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicle } from "@/hooks/useVehicles";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "BookingConfirmation">;

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(route.params.vehicleId);

  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    if (!vehicle || !user) return;

    setIsLoading(true);

    try {
      // 1. Create trip record (status: pending payment)
      const tripRes = await apiRequest("POST", "/api/trips", {
        vehicleId: vehicle.id,
        userId: user.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "pending",
        totalCost: totalCost.toFixed(2),
        pickupLocation: vehicle.location?.address ?? "",
      });
      const trip = await tripRes.json();

      // 2. Create PayPal order on server
      const orderRes = await apiRequest("POST", "/api/paypal/create-order", {
        tripId: trip.id,
        amount: totalCost,
      });
      const { orderId, approvalUrl, paymentId } = await orderRes.json();

      // 3. Open PayPal approval in browser
      const result = await WebBrowser.openAuthSessionAsync(approvalUrl, "rush://");

      if (result.type !== "success") {
        // User cancelled or browser closed without approval
        Alert.alert("Payment Cancelled", "The payment was not completed.");
        return;
      }

      // 4. Parse orderId from the deep link return URL
      const returnedUrl = result.url;
      const parsed = Linking.parse(returnedUrl);

      if (parsed.path !== "payment/success") {
        Alert.alert("Payment Cancelled", "The payment was not completed.");
        return;
      }

      const returnedOrderId = parsed.queryParams?.orderId as string | undefined;
      if (!returnedOrderId || returnedOrderId !== orderId) {
        Alert.alert("Payment Error", "Order ID mismatch. Please try again.");
        return;
      }

      // 5. Capture payment on server — moves trip to upcoming
      const captureRes = await apiRequest("POST", "/api/paypal/capture-order", {
        orderId,
        paymentId,
        tripId: trip.id,
      });

      if (!captureRes.ok) {
        const err = await captureRes.json();
        Alert.alert("Payment Failed", err.error || "Could not capture payment.");
        return;
      }

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
                }),
              );
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to complete booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [agreedToTerms, vehicle, user, startDate, endDate, totalCost, navigation]);

  if (isLoadingVehicle) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading vehicle...</ThemedText>
      </View>
    );
  }

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
              <ThemedText type="body">{vehicle.location?.address}</ThemedText>
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
          <View style={styles.paymentMethodRow}>
            <Feather name="credit-card" size={20} color={Colors.light.primary} />
            <ThemedText type="small" style={styles.paymentMethodLabel}>Card</ThemedText>
          </View>
          <ThemedText type="small" style={styles.paymentSeparator}>or</ThemedText>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paypalBadge}>
              <ThemedText type="small" style={styles.paypalText}>PP</ThemedText>
            </View>
            <ThemedText type="small" style={styles.paymentMethodLabel}>PayPal</ThemedText>
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
                backgroundColor: agreedToTerms ? Colors.light.primary : "transparent",
                borderColor: agreedToTerms ? Colors.light.primary : theme.textSecondary,
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
          {isLoading ? "Processing..." : `Pay $${totalCost.toFixed(2)} with PayPal`}
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
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  paymentMethodLabel: {
    fontWeight: "600",
  },
  paymentSeparator: {
    color: "#999",
  },
  paypalBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#003087",
    alignItems: "center",
    justifyContent: "center",
  },
  paypalText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 9,
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
