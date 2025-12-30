import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTrips } from "@/hooks/useTrips";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "ActiveTrip">;

export default function ActiveTripScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { trips, updateTrip } = useTrips();

  const trip = useMemo(() => {
    return trips.find((t) => t.id === route.params.tripId);
  }, [trips, route.params.tripId]);

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (!trip) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(trip.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("Trip ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [trip]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSupport = useCallback(() => {
    Alert.alert(
      "Contact Support",
      "Need help during your trip?\n\nCall: 1-800-RUSH-CAR\nEmail: support@rush-enterprise.com",
      [{ text: "OK" }]
    );
  }, []);

  const handleEndTrip = useCallback(async () => {
    Alert.alert(
      "End Trip",
      "Are you sure you want to end your trip now? Make sure the vehicle is parked at the designated location.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Trip",
          style: "destructive",
          onPress: async () => {
            if (!trip) return;
            setIsEnding(true);
            try {
              await updateTrip(trip.id, { status: "completed" });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                "Trip Completed!",
                "Thank you for riding with Rush. Your trip has been completed successfully.",
                [
                  {
                    text: "OK",
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
              Alert.alert("Error", "Failed to end trip. Please try again.");
            } finally {
              setIsEnding(false);
            }
          },
        },
      ]
    );
  }, [trip, updateTrip, navigation]);

  if (!trip) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <ThemedText type="h2">Trip not found</ThemedText>
          <Button onPress={handleClose} style={styles.errorButton}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="map" size={64} color={theme.textSecondary} />
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          Map View
        </ThemedText>
      </View>

      <Pressable
        onPress={handleClose}
        style={[
          styles.closeButton,
          { backgroundColor: theme.backgroundRoot, top: insets.top + Spacing.md },
        ]}
      >
        <Feather name="x" size={24} color={theme.text} />
      </Pressable>

      <Pressable
        onPress={handleSupport}
        style={[
          styles.supportButton,
          { backgroundColor: theme.backgroundRoot, top: insets.top + Spacing.md },
        ]}
      >
        <Feather name="phone" size={20} color={Colors.light.primary} />
      </Pressable>

      <View
        style={[
          styles.tripInfoCard,
          { backgroundColor: theme.backgroundRoot, top: insets.top + 70 },
        ]}
      >
        <View style={styles.timerContainer}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            TIME REMAINING
          </ThemedText>
          <ThemedText type="h1" style={[styles.timer, { color: Colors.light.primary }]}>
            {timeRemaining}
          </ThemedText>
        </View>
        <View style={styles.tripDetails}>
          <ThemedText type="h4">{trip.vehicle.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Ends at{" "}
            {new Date(trip.endDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </ThemedText>
        </View>
      </View>

      <View
        style={[
          styles.navigationCard,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View style={styles.navigationContent}>
          <Feather name="navigation" size={24} color={Colors.light.primary} />
          <View style={styles.navigationText}>
            <ThemedText type="body">Return Location</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {trip.vehicle.location.address}
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={[styles.directionsButton, { backgroundColor: Colors.light.secondary }]}
        >
          <Feather name="map-pin" size={18} color="#FFFFFF" />
          <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
            Directions
          </ThemedText>
        </Pressable>
      </View>

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
          onPress={handleEndTrip}
          style={[styles.endTripButton, { backgroundColor: Colors.light.error }]}
          disabled={isEnding}
        >
          {isEnding ? "Ending Trip..." : "End Trip"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorButton: {
    marginTop: Spacing.xl,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  supportButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  tripInfoCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  timerContainer: {
    alignItems: "center",
    marginRight: Spacing.xl,
  },
  timer: {
    fontVariant: ["tabular-nums"],
  },
  tripDetails: {
    flex: 1,
  },
  navigationCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navigationText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    ...Shadows.large,
  },
  endTripButton: {
    width: "100%",
  },
});
