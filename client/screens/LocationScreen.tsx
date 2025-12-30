import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, TextInput, Alert } from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: "1", name: "Home", address: "123 Main St, San Francisco, CA", isDefault: true },
    { id: "2", name: "Work", address: "456 Market St, San Francisco, CA", isDefault: false },
  ]);

  const handleSetDefault = useCallback((id: string) => {
    setSavedLocations(prev =>
      prev.map(loc => ({ ...loc, isDefault: loc.id === id }))
    );
  }, []);

  const handleRemoveLocation = useCallback((id: string) => {
    Alert.alert(
      "Remove Location",
      "Are you sure you want to remove this saved location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSavedLocations(prev => prev.filter(loc => loc.id !== id));
          },
        },
      ]
    );
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    Alert.alert(
      "Use Current Location",
      "In a production app, this would request location permission and set your current location as default.",
      [{ text: "OK" }]
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Default Location</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for a location..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <Pressable
          style={[styles.currentLocationBtn, { backgroundColor: Colors.light.primary + "15" }]}
          onPress={handleUseCurrentLocation}
        >
          <Feather name="navigation" size={20} color={Colors.light.primary} />
          <ThemedText type="h4" style={{ color: Colors.light.primary, marginLeft: Spacing.sm }}>
            Use Current Location
          </ThemedText>
        </Pressable>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Saved Locations
        </ThemedText>

        {savedLocations.map((location) => (
          <Pressable
            key={location.id}
            style={[
              styles.locationItem,
              { backgroundColor: theme.backgroundDefault },
              location.isDefault && { borderColor: Colors.light.primary, borderWidth: 2 },
            ]}
            onPress={() => handleSetDefault(location.id)}
          >
            <View style={[styles.locationIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather
                name={location.name === "Home" ? "home" : location.name === "Work" ? "briefcase" : "map-pin"}
                size={20}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <ThemedText type="h4">{location.name}</ThemedText>
                {location.isDefault ? (
                  <View style={[styles.defaultBadge, { backgroundColor: Colors.light.primary }]}>
                    <ThemedText type="small" style={{ color: "#fff" }}>Default</ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {location.address}
              </ThemedText>
            </View>
            {!location.isDefault ? (
              <Pressable onPress={() => handleRemoveLocation(location.id)} hitSlop={8}>
                <Feather name="x" size={20} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}

        <Button
          onPress={() => Alert.alert("Add Location", "Location search would open here.")}
          style={styles.addButton}
        >
          Add New Location
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
    paddingTop: Spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  addButton: {
    marginTop: Spacing.lg,
  },
});
