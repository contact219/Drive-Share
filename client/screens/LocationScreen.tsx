import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, TextInput, Alert, Platform, ActivityIndicator, Linking } from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { settings, addLocation, removeLocation, setDefaultLocation } = useSettings();
  const [searchText, setSearchText] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = useCallback((id: string) => {
    setDefaultLocation(id);
  }, [setDefaultLocation]);

  const handleRemoveLocation = useCallback((id: string) => {
    const location = settings.savedLocations.find(l => l.id === id);
    if (location?.isDefault) {
      Alert.alert("Cannot Remove", "You cannot remove the default location. Set another location as default first.");
      return;
    }
    removeLocation(id);
  }, [removeLocation, settings.savedLocations]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert("Limited on Web", "Location features work best in Expo Go on your mobile device.");
      return;
    }

    setIsLocating(true);
    try {
      const permResult = await Location.requestForegroundPermissionsAsync();
      if (!permResult.granted) {
        if (permResult.status === "denied" && !permResult.canAskAgain && Platform.OS !== "web") {
          Alert.alert(
            "Permission Required",
            "Location permission was denied. Please enable it in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: async () => {
                  try {
                    await Linking.openSettings();
                  } catch {}
                },
              },
            ]
          );
        } else {
          Alert.alert("Permission Denied", "Location permission is required to use this feature.");
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      let address = "Current Location";
      if (geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.street, g.city, g.region].filter(Boolean);
        address = parts.join(", ") || "Current Location";
      }

      addLocation({
        name: "Current Location",
        address,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        isDefault: true,
      });
    } catch (error) {
      Alert.alert("Error", "Could not get your current location. Please try again.");
    } finally {
      setIsLocating(false);
    }
  }, [addLocation]);

  const handleAddLocation = useCallback(() => {
    if (!newLocationName.trim() || !newLocationAddress.trim()) {
      Alert.alert("Missing Info", "Please enter both a name and address for the location.");
      return;
    }

    addLocation({
      name: newLocationName.trim(),
      address: newLocationAddress.trim(),
      isDefault: settings.savedLocations.length === 0,
    });

    setNewLocationName("");
    setNewLocationAddress("");
    setShowAddForm(false);
  }, [newLocationName, newLocationAddress, addLocation, settings.savedLocations.length]);

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
        <Pressable
          style={[styles.currentLocationBtn, { backgroundColor: Colors.light.primary + "15" }]}
          onPress={handleUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Feather name="navigation" size={20} color={Colors.light.primary} />
          )}
          <ThemedText type="h4" style={{ color: Colors.light.primary, marginLeft: Spacing.sm }}>
            {isLocating ? "Getting Location..." : "Use Current Location"}
          </ThemedText>
        </Pressable>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Saved Locations
        </ThemedText>

        {settings.savedLocations.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="map-pin" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
              No saved locations yet. Use your current location or add one manually.
            </ThemedText>
          </View>
        ) : null}

        {settings.savedLocations.map((location) => (
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
                name={location.name === "Home" ? "home" : location.name === "Work" ? "briefcase" : location.name === "Current Location" ? "navigation" : "map-pin"}
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

        {showAddForm ? (
          <View style={[styles.addForm, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Add New Location</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundRoot }]}>
              <Feather name="tag" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.formInput, { color: theme.text }]}
                placeholder="Location name (e.g. Home, Office)"
                placeholderTextColor={theme.textSecondary}
                value={newLocationName}
                onChangeText={setNewLocationName}
              />
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundRoot }]}>
              <Feather name="map-pin" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.formInput, { color: theme.text }]}
                placeholder="Address"
                placeholderTextColor={theme.textSecondary}
                value={newLocationAddress}
                onChangeText={setNewLocationAddress}
              />
            </View>
            <View style={styles.formButtons}>
              <Pressable onPress={() => setShowAddForm(false)} style={styles.cancelBtn}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </Pressable>
              <Button onPress={handleAddLocation} style={styles.saveBtn}>
                Save Location
              </Button>
            </View>
          </View>
        ) : (
          <Button
            onPress={() => setShowAddForm(true)}
            style={styles.addButton}
          >
            Add New Location
          </Button>
        )}
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
  emptyState: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
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
  addForm: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    padding: Spacing.sm,
  },
  saveBtn: {
    flex: 0,
    paddingHorizontal: Spacing.xl,
  },
});
