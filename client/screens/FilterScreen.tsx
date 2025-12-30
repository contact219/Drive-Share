import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { CategoryChip } from "@/components/CategoryChip";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { VEHICLE_TYPES, VEHICLE_FEATURES } from "@/types";

export default function FilterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([5, 50]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(null);
  const [minSeats, setMinSeats] = useState(2);

  const fuelTypes = [
    { label: "Gasoline", value: "gasoline" },
    { label: "Diesel", value: "diesel" },
    { label: "Electric", value: "electric" },
    { label: "Hybrid", value: "hybrid" },
  ];

  const transmissionTypes = [
    { label: "Automatic", value: "automatic" },
    { label: "Manual", value: "manual" },
  ];

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleFeatureToggle = useCallback((feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  }, []);

  const handleFuelToggle = useCallback((fuel: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(fuel)
        ? prev.filter((f) => f !== fuel)
        : [...prev, fuel]
    );
  }, []);

  const handleTransmissionToggle = useCallback((transmission: string) => {
    setSelectedTransmission((prev) => (prev === transmission ? null : transmission));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTypes([]);
    setPriceRange([5, 50]);
    setMaxDistance(50);
    setSelectedFeatures([]);
    setSelectedFuelTypes([]);
    setSelectedTransmission(null);
    setMinSeats(2);
  }, []);

  const handleApply = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const activeFiltersCount =
    selectedTypes.length +
    (priceRange[0] > 5 || priceRange[1] < 50 ? 1 : 0) +
    (maxDistance < 50 ? 1 : 0) +
    selectedFeatures.length +
    selectedFuelTypes.length +
    (selectedTransmission ? 1 : 0) +
    (minSeats > 2 ? 1 : 0);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Cancel
          </ThemedText>
        </Pressable>
        <ThemedText type="h4">Filters</ThemedText>
        <Pressable onPress={handleClearAll} hitSlop={8}>
          <ThemedText type="body" style={{ color: Colors.light.primary }}>
            Clear All
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Vehicle Type
        </ThemedText>
        <View style={styles.chipGrid}>
          {VEHICLE_TYPES.map((type) => (
            <CategoryChip
              key={type.value}
              label={type.label}
              isSelected={selectedTypes.includes(type.value)}
              onPress={() => handleTypeToggle(type.value)}
            />
          ))}
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Price Range
        </ThemedText>
        <View style={[styles.sliderCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sliderHeader}>
            <ThemedText type="body">
              ${priceRange[0]} - ${priceRange[1]}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              per hour
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={100}
            value={priceRange[1]}
            onValueChange={(value) => setPriceRange([priceRange[0], Math.round(value)])}
            minimumTrackTintColor={Colors.light.primary}
            maximumTrackTintColor={theme.backgroundSecondary}
            thumbTintColor={Colors.light.primary}
          />
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Maximum Distance
        </ThemedText>
        <View style={[styles.sliderCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sliderHeader}>
            <ThemedText type="body">{maxDistance} miles</ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={10}
            value={maxDistance}
            onValueChange={(value) => setMaxDistance(Math.round(value * 10) / 10)}
            minimumTrackTintColor={Colors.light.primary}
            maximumTrackTintColor={theme.backgroundSecondary}
            thumbTintColor={Colors.light.primary}
          />
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Fuel Type
        </ThemedText>
        <View style={styles.chipGrid}>
          {fuelTypes.map((fuel) => (
            <CategoryChip
              key={fuel.value}
              label={fuel.label}
              isSelected={selectedFuelTypes.includes(fuel.value)}
              onPress={() => handleFuelToggle(fuel.value)}
            />
          ))}
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Transmission
        </ThemedText>
        <View style={styles.chipGrid}>
          {transmissionTypes.map((trans) => (
            <CategoryChip
              key={trans.value}
              label={trans.label}
              isSelected={selectedTransmission === trans.value}
              onPress={() => handleTransmissionToggle(trans.value)}
            />
          ))}
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Minimum Seats
        </ThemedText>
        <View style={[styles.sliderCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sliderHeader}>
            <ThemedText type="body">{minSeats}+ seats</ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={8}
            step={1}
            value={minSeats}
            onValueChange={(value) => setMinSeats(Math.round(value))}
            minimumTrackTintColor={Colors.light.primary}
            maximumTrackTintColor={theme.backgroundSecondary}
            thumbTintColor={Colors.light.primary}
          />
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Features
        </ThemedText>
        <View style={styles.chipGrid}>
          {VEHICLE_FEATURES.map((feature) => (
            <CategoryChip
              key={feature}
              label={feature}
              isSelected={selectedFeatures.includes(feature)}
              onPress={() => handleFeatureToggle(feature)}
            />
          ))}
        </View>
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
        <Button onPress={handleApply} style={styles.applyButton}>
          Apply Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sliderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
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
  applyButton: {
    width: "100%",
  },
});
