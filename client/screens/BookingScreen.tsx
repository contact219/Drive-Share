import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getVehicleById } from "@/lib/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "Booking">;

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const vehicle = useMemo(() => {
    return getVehicleById(route.params.vehicleId);
  }, [route.params.vehicleId]);

  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getTime() + 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date(now.getTime() + 4 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const duration = useMemo(() => {
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.max(1, Math.ceil(diff / (1000 * 60 * 60)));
    return hours;
  }, [startDate, endDate]);

  const totalCost = useMemo(() => {
    if (!vehicle) return 0;
    return duration * vehicle.pricePerHour;
  }, [duration, vehicle]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStartDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      setShowStartPicker(false);
      if (selectedDate) {
        setStartDate(selectedDate);
        if (selectedDate >= endDate) {
          setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
        }
      }
    },
    [endDate]
  );

  const handleEndDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      setShowEndPicker(false);
      if (selectedDate) {
        if (selectedDate > startDate) {
          setEndDate(selectedDate);
        } else {
          Alert.alert("Invalid Time", "End time must be after start time.");
        }
      }
    },
    [startDate]
  );

  const handleContinue = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to continue with your booking.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => navigation.navigate("Auth"),
          },
        ]
      );
      return;
    }

    if (vehicle) {
      navigation.navigate("BookingConfirmation", {
        vehicleId: vehicle.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    }
  }, [isAuthenticated, vehicle, startDate, endDate, navigation]);

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="h2">Vehicle not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={[styles.vehicleCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4">{vehicle.name}</ThemedText>
          <View style={styles.vehicleDetails}>
            <ThemedText type="body" style={{ color: Colors.light.primary }}>
              ${vehicle.pricePerHour}/hr
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {vehicle.location.address}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          Select Date & Time
        </ThemedText>

        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={[styles.dateTimeCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.dateTimeRow}>
            <Feather name="calendar" size={20} color={Colors.light.primary} />
            <View style={styles.dateTimeContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Start
              </ThemedText>
              <ThemedText type="body">
                {formatDate(startDate)} at {formatTime(startDate)}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Pressable>

        {showStartPicker ? (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleStartDateChange}
            minimumDate={now}
          />
        ) : null}

        <Pressable
          onPress={() => setShowEndPicker(true)}
          style={[styles.dateTimeCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.dateTimeRow}>
            <Feather name="calendar" size={20} color={Colors.light.primary} />
            <View style={styles.dateTimeContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                End
              </ThemedText>
              <ThemedText type="body">
                {formatDate(endDate)} at {formatTime(endDate)}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Pressable>

        {showEndPicker ? (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleEndDateChange}
            minimumDate={new Date(startDate.getTime() + 60 * 60 * 1000)}
          />
        ) : null}

        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.summaryTitle}>
            Booking Summary
          </ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Duration
            </ThemedText>
            <ThemedText type="body">
              {duration} hour{duration !== 1 ? "s" : ""}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Rate
            </ThemedText>
            <ThemedText type="body">${vehicle.pricePerHour}/hr</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <ThemedText type="h4">Estimated Total</ThemedText>
            <ThemedText type="h3" style={{ color: Colors.light.primary }}>
              ${totalCost.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.availabilityCard, { backgroundColor: Colors.light.success + "20" }]}>
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={{ color: Colors.light.success, marginLeft: Spacing.sm }}>
            Vehicle is available for selected time
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Button onPress={handleContinue} style={styles.continueButton}>
          Continue to Confirm
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  vehicleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  vehicleDetails: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  dateTimeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  summaryTitle: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: Spacing.sm,
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
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
  continueButton: {
    width: "100%",
  },
});
