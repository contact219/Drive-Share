import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "EditVehicle">;

const VEHICLE_TYPE_OPTIONS = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Truck", value: "truck" },
  { label: "Van", value: "van" },
  { label: "Sports", value: "sports" },
  { label: "Luxury", value: "luxury" },
  { label: "Compact", value: "compact" },
  { label: "Electric", value: "electric" },
];
const FUEL_TYPE_OPTIONS = [
  { label: "Gasoline", value: "gas" },
  { label: "Electric", value: "electric" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Diesel", value: "diesel" },
];
const TRANSMISSION_OPTIONS = [
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];
const VEHICLE_TYPES = VEHICLE_TYPE_OPTIONS.map(o => o.label);
const FUEL_TYPES = FUEL_TYPE_OPTIONS.map(o => o.label);
const TRANSMISSIONS = TRANSMISSION_OPTIONS.map(o => o.label);
const FEATURES = ["Bluetooth", "GPS", "Backup Camera", "Heated Seats", "Sunroof", "USB Charging", "Apple CarPlay", "Android Auto", "Cruise Control", "Keyless Entry"];

export default function EditVehicleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { ownerVehicleId, ownerId, vehicle } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [vehicleType, setVehicleType] = useState(
    VEHICLE_TYPE_OPTIONS.find(o => o.value === vehicle.type.toLowerCase())?.label ??
    VEHICLE_TYPES.find(t => t.toLowerCase() === vehicle.type.toLowerCase()) ?? "Sedan"
  );
  const [fuelType, setFuelType] = useState(
    FUEL_TYPE_OPTIONS.find(o => o.value === vehicle.fuelType.toLowerCase())?.label ??
    FUEL_TYPES.find(f => f.toLowerCase() === vehicle.fuelType.toLowerCase()) ?? "Gasoline"
  );
  const [transmission, setTransmission] = useState(
    TRANSMISSION_OPTIONS.find(o => o.value === vehicle.transmission.toLowerCase())?.label ??
    TRANSMISSIONS.find(t => t.toLowerCase() === vehicle.transmission.toLowerCase()) ?? "Automatic"
  );
  const [seats, setSeats] = useState(String(vehicle.seats));
  const [pricePerHour, setPricePerHour] = useState(String(parseFloat(vehicle.pricePerHour)));
  const [locationAddress, setLocationAddress] = useState(vehicle.locationAddress || "");
  const [imageUrl, setImageUrl] = useState(vehicle.imageUrl || "");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(vehicle.features || []);

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!brand || !model || !year || !vehicleType || !fuelType || !transmission || !pricePerHour || !locationAddress) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert("Invalid Year", "Please enter a valid vehicle year.");
      return;
    }

    const priceNum = parseFloat(pricePerHour);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid hourly rate.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        new URL(`/api/owner/vehicles/${ownerVehicleId}`, getApiUrl()).toString(),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleData: {
              name: `${brand} ${model}`,
              brand,
              model,
              year: yearNum,
              type: VEHICLE_TYPE_OPTIONS.find(o => o.label === vehicleType)?.value ?? vehicleType.toLowerCase(),
              pricePerHour: priceNum.toFixed(2),
              imageUrl: imageUrl || vehicle.imageUrl,
              seats: parseInt(seats) || 5,
              fuelType: FUEL_TYPE_OPTIONS.find(o => o.label === fuelType)?.value ?? fuelType.toLowerCase(),
              transmission: TRANSMISSION_OPTIONS.find(o => o.label === transmission)?.value ?? transmission.toLowerCase(),
              features: selectedFeatures,
              locationAddress,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update");

      queryClient.invalidateQueries({ queryKey: ["/api/owner", ownerId, "vehicles"] });

      Alert.alert(
        "Vehicle Updated",
        "Your vehicle listing has been updated successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [ownerVehicleId, ownerId, brand, model, year, vehicleType, fuelType, transmission, seats, pricePerHour, locationAddress, imageUrl, selectedFeatures, queryClient, navigation, vehicle.imageUrl]);

  const renderSelector = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <ThemedText type="body" style={styles.label}>{label} *</ThemedText>
      <View style={styles.optionGrid}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: selected.toLowerCase() === option.toLowerCase() ? theme.primary : theme.backgroundDefault,
                borderColor: selected.toLowerCase() === option.toLowerCase() ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <ThemedText
              type="small"
              style={{ color: selected.toLowerCase() === option.toLowerCase() ? "#fff" : theme.text }}
            >
              {option}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Edit Vehicle</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["2xl"] },
        ]}
      >
        <Card style={styles.formCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Vehicle Details</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>Brand *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g., Toyota"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>Model *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={model}
              onChangeText={setModel}
              placeholder="e.g., Camry"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <ThemedText type="body" style={styles.label}>Year *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={year}
                onChangeText={setYear}
                placeholder="2023"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
              <ThemedText type="body" style={styles.label}>Seats</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={seats}
                onChangeText={setSeats}
                placeholder="5"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          {renderSelector("Vehicle Type", VEHICLE_TYPES, vehicleType, setVehicleType)}
          {renderSelector("Fuel Type", FUEL_TYPES, fuelType, setFuelType)}
          {renderSelector("Transmission", TRANSMISSIONS, transmission, setTransmission)}
        </Card>

        <Card style={styles.formCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Pricing & Location</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>Price Per Hour ($) *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={pricePerHour}
              onChangeText={setPricePerHour}
              placeholder="15.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>Pickup Location *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={locationAddress}
              onChangeText={setLocationAddress}
              placeholder="123 Main St, City, State"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>Vehicle Image URL (optional)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/car-image.jpg"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </Card>

        <Card style={styles.formCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Features</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
            Select all features your vehicle has
          </ThemedText>
          <View style={styles.optionGrid}>
            {FEATURES.map((feature) => (
              <Pressable
                key={feature}
                style={[
                  styles.featureButton,
                  {
                    backgroundColor: selectedFeatures.includes(feature) ? theme.primary + "20" : theme.backgroundDefault,
                    borderColor: selectedFeatures.includes(feature) ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => toggleFeature(feature)}
              >
                {selectedFeatures.includes(feature) ? (
                  <Feather name="check" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                ) : null}
                <ThemedText
                  type="small"
                  style={{ color: selectedFeatures.includes(feature) ? theme.primary : theme.text }}
                >
                  {feature}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: { padding: Spacing.xs },
  placeholder: { width: 32 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: { marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.xs, fontWeight: "500" },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  row: { flexDirection: "row" },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  submitButton: { marginBottom: Spacing.xl },
});
