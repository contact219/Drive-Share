import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { TextInput } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

interface OwnerProfile {
  id: string;
  userId: string;
}

export default function AddVehicleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vehicleType, setVehicleType] = useState("Sedan");
  const [fuelType, setFuelType] = useState("Gasoline");
  const [transmission, setTransmission] = useState("Automatic");
  const [seats, setSeats] = useState("5");
  const [pricePerHour, setPricePerHour] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: ownerProfile } = useQuery<OwnerProfile | null>({
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
  });

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!ownerProfile?.id) {
      Alert.alert("Error", "Owner profile not found. Please try again.");
      return;
    }

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
      const typeValue = VEHICLE_TYPE_OPTIONS.find(o => o.label === vehicleType)?.value ?? vehicleType.toLowerCase();
      const fuelValue = FUEL_TYPE_OPTIONS.find(o => o.label === fuelType)?.value ?? fuelType.toLowerCase();
      const transmissionValue = TRANSMISSION_OPTIONS.find(o => o.label === transmission)?.value ?? transmission.toLowerCase();

      const vehicleData = {
        name: `${brand} ${model}`,
        brand,
        model,
        year: yearNum,
        type: typeValue,
        pricePerHour: priceNum.toFixed(2),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
        seats: parseInt(seats) || 5,
        fuelType: fuelValue,
        transmission: transmissionValue,
        features: selectedFeatures,
        locationAddress,
      };

      await apiRequest("POST", "/api/owner/vehicles", {
        ownerId: ownerProfile.id,
        vehicleData,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/owner", ownerProfile.id, "vehicles"] });

      Alert.alert(
        "Vehicle Submitted",
        "Your vehicle listing has been submitted for review. You will be notified once it's approved.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error creating vehicle:", error);
      Alert.alert("Error", "Failed to create vehicle listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [ownerProfile, brand, model, year, vehicleType, fuelType, transmission, seats, pricePerHour, locationAddress, imageUrl, selectedFeatures, queryClient, navigation]);

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
                backgroundColor: selected === option ? theme.primary : theme.backgroundDefault,
                borderColor: selected === option ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <ThemedText 
              type="small" 
              style={{ color: selected === option ? "#fff" : theme.text }}
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
        <ThemedText type="h3">List Your Vehicle</ThemedText>
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
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Leave blank to use a default image
            </ThemedText>
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
                {selectedFeatures.includes(feature) && (
                  <Feather name="check" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                )}
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

        <View style={styles.infoBox}>
          <Feather name="info" size={20} color={Colors.light.primary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1, marginLeft: Spacing.sm }}>
            Your vehicle will be reviewed by our team before it goes live. You'll receive an email notification once it's approved.
          </ThemedText>
        </View>

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? "Submitting..." : "Submit for Review"}
        </Button>
      </KeyboardAwareScrollViewCompat>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    backgroundColor: Colors.light.primary + "10",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginBottom: Spacing.xl,
  },
});
