import React, { useState, useMemo, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Platform, ActivityIndicator, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useVehicle } from "@/hooks/useVehicles";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest, getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "Booking">;

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(route.params.vehicleId);

  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getTime() + 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date(now.getTime() + 4 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [quote, setQuote] = useState<{
    available: boolean;
    hours: number;
    days: number;
    baseCost: string;
    insuranceCost: string;
    serviceFee: string;
    totalCost: string;
  } | null>(null);

  const duration = useMemo(() => {
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.max(1, Math.ceil(diff / (1000 * 60 * 60)));
    return hours;
  }, [startDate, endDate]);

  useEffect(() => {
    if (!vehicle) return;

    const fetchQuote = async () => {
      setIsCheckingAvailability(true);
      setAvailabilityStatus("checking");

      try {
        const response = await fetch(new URL("/api/trips/quote", getApiUrl()).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleId: vehicle.id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            includeInsurance,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          setAvailabilityStatus(data.available ? "available" : "unavailable");
        } else {
          setAvailabilityStatus(null);
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        setAvailabilityStatus(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    fetchQuote();
  }, [vehicle, startDate, endDate, includeInsurance]);

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

  const openStartPicker = useCallback(() => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: "date",
        minimumDate: now,
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (_e, selectedTime) => {
              if (!selectedTime) return;
              const combined = new Date(selectedDate);
              combined.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setStartDate(combined);
              if (combined >= endDate) {
                setEndDate(new Date(combined.getTime() + 60 * 60 * 1000));
              }
            },
          });
        },
      });
    } else {
      setShowStartPicker(true);
    }
  }, [startDate, endDate, now]);

  const openEndPicker = useCallback(() => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: endDate,
        mode: "date",
        minimumDate: new Date(startDate.getTime() + 60 * 60 * 1000),
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (_e, selectedTime) => {
              if (!selectedTime) return;
              const combined = new Date(selectedDate);
              combined.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              if (combined > startDate) {
                setEndDate(combined);
              } else {
                Alert.alert("Invalid Time", "End time must be after start time.");
              }
            },
          });
        },
      });
    } else {
      setShowEndPicker(true);
    }
  }, [startDate, endDate]);

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

    if (availabilityStatus === "unavailable") {
      Alert.alert(
        "Not Available",
        "This vehicle is not available for the selected dates. Please choose different dates.",
        [{ text: "OK" }]
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
  }, [isAuthenticated, vehicle, startDate, endDate, navigation, availabilityStatus]);

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
          onPress={openStartPicker}
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

        {Platform.OS === "ios" && showStartPicker ? (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display="spinner"
            onChange={handleStartDateChange}
            minimumDate={now}
          />
        ) : null}

        <Pressable
          onPress={openEndPicker}
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

        {Platform.OS === "ios" && showEndPicker ? (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display="spinner"
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
              {quote ? (quote.days > 1 ? `${quote.days} days` : `${quote.hours} hour${quote.hours !== 1 ? "s" : ""}`) : `${duration} hour${duration !== 1 ? "s" : ""}`}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Base Cost
            </ThemedText>
            <ThemedText type="body">${quote?.baseCost || (duration * vehicle.pricePerHour).toFixed(2)}</ThemedText>
          </View>

          <View style={styles.insuranceRow}>
            <View style={styles.insuranceLabel}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Insurance Protection
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                ${15}/day coverage
              </ThemedText>
            </View>
            <Switch
              value={includeInsurance}
              onValueChange={setIncludeInsurance}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {includeInsurance && quote ? (
            <View style={styles.summaryRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Insurance
              </ThemedText>
              <ThemedText type="body">${quote.insuranceCost}</ThemedText>
            </View>
          ) : null}

          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Service Fee (10%)
            </ThemedText>
            <ThemedText type="body">${quote?.serviceFee || "0.00"}</ThemedText>
          </View>

          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <ThemedText type="h4">Estimated Total</ThemedText>
            {isCheckingAvailability ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ThemedText type="h3" style={{ color: Colors.light.primary }}>
                ${quote?.totalCost || "0.00"}
              </ThemedText>
            )}
          </View>
        </View>

        {availabilityStatus === "checking" ? (
          <View style={[styles.availabilityCard, { backgroundColor: theme.backgroundDefault }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              Checking availability...
            </ThemedText>
          </View>
        ) : availabilityStatus === "available" ? (
          <View style={[styles.availabilityCard, { backgroundColor: Colors.light.success + "20" }]}>
            <Feather name="check-circle" size={20} color={Colors.light.success} />
            <ThemedText type="body" style={{ color: Colors.light.success, marginLeft: Spacing.sm }}>
              Vehicle is available for selected time
            </ThemedText>
          </View>
        ) : availabilityStatus === "unavailable" ? (
          <View style={[styles.availabilityCard, { backgroundColor: Colors.light.error + "20" }]}>
            <Feather name="x-circle" size={20} color={Colors.light.error} />
            <ThemedText type="body" style={{ color: Colors.light.error, marginLeft: Spacing.sm }}>
              Vehicle is not available for this time period
            </ThemedText>
          </View>
        ) : null}
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
  insuranceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginTop: Spacing.sm,
  },
  insuranceLabel: {
    flex: 1,
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
