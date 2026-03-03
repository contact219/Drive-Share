import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Platform, ActivityIndicator, ViewStyle, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useVehicles } from "@/hooks/useVehicles";
import { useFavorites } from "@/hooks/useFavorites";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Vehicle } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Image } from "expo-image";

let MapView: any = null;
let Marker: any = null;
let Location: any = null;
let mapsAvailable = false;

const isExpoGo = Constants.appOwnership === "expo";

if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
    Marker = require("react-native-maps").Marker;
    Location = require("expo-location");
    mapsAvailable = true;
  } catch (e) {
    mapsAvailable = false;
  }
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function VehicleMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { data: vehicles = [], isLoading } = useVehicles();
  const { isFavorite, toggleFavorite } = useFavorites();
  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");
      
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch (e) {
        }
      }
    })();
  }, []);

  const vehiclesWithLocation = useMemo(() => {
    return vehicles.filter(
      (v) => v.location?.latitude && v.location?.longitude && v.available
    );
  }, [vehicles]);

  const handleMarkerPress = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    if (vehicle.location?.latitude && vehicle.location?.longitude) {
      mapRef.current?.animateToRegion({
        latitude: vehicle.location.latitude,
        longitude: vehicle.location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, []);

  const handleVehiclePress = useCallback(() => {
    if (selectedVehicle) {
      navigation.navigate("VehicleDetail", { vehicleId: selectedVehicle.id });
    }
  }, [navigation, selectedVehicle]);

  const handleCenterLocation = useCallback(async () => {
    if (locationPermission) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (e) {
      }
    }
  }, [locationPermission]);

  const handleCloseCard = useCallback(() => {
    setSelectedVehicle(null);
  }, []);

  if (Platform.OS === "web" || (Platform.OS === "android" && isExpoGo)) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.webFallbackHeader, { paddingTop: insets.top + Spacing.md }]}>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: Spacing.xs }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h3">Nearby Vehicles</ThemedText>
          <View style={{ width: 32 }} />
        </View>
        <View style={[styles.webFallbackBanner, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="map" size={20} color={Colors.light.primary} />
          <ThemedText type="small" style={{ color: Colors.light.primary, marginLeft: Spacing.sm, flex: 1 }}>
            {Platform.OS === "android"
              ? "Map view requires a development build on Android."
              : "Map view is available in Expo Go on your mobile device."}
          </ThemedText>
        </View>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }}>
            {vehicles.filter(v => v.available).map((vehicle) => (
              <Pressable
                key={vehicle.id}
                style={[styles.webVehicleItem, { backgroundColor: theme.backgroundDefault }]}
                onPress={() => navigation.navigate("VehicleDetail", { vehicleId: vehicle.id })}
              >
                <Image
                  source={{ uri: vehicle.imageUrl }}
                  style={styles.webVehicleImage}
                  contentFit="cover"
                />
                <View style={styles.webVehicleInfo}>
                  <ThemedText type="h4" numberOfLines={1}>{vehicle.name}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {vehicle.location?.address || "Location available"}
                  </ThemedText>
                  <ThemedText type="h4" style={{ color: Colors.light.primary, marginTop: 4 }}>
                    ${vehicle.pricePerHour}/hr
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={locationPermission === true}
        showsMyLocationButton={false}
        onPress={handleCloseCard}
      >
        {vehiclesWithLocation.map((vehicle) => (
          <Marker
            key={vehicle.id}
            coordinate={{
              latitude: vehicle.location!.latitude,
              longitude: vehicle.location!.longitude,
            }}
            onPress={() => handleMarkerPress(vehicle)}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  backgroundColor:
                    selectedVehicle?.id === vehicle.id
                      ? theme.primary
                      : theme.backgroundRoot,
                  borderColor:
                    selectedVehicle?.id === vehicle.id
                      ? theme.primary
                      : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.markerPrice,
                  {
                    color:
                      selectedVehicle?.id === vehicle.id
                        ? "#FFFFFF"
                        : theme.text,
                  },
                ]}
              >
                ${vehicle.pricePerHour}
              </ThemedText>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.backgroundRoot }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={[styles.titleContainer, { backgroundColor: theme.backgroundRoot }]}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {vehiclesWithLocation.length} vehicles nearby
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={[
          styles.locationButton,
          { backgroundColor: theme.backgroundRoot, bottom: selectedVehicle ? 200 : 100 + insets.bottom },
        ]}
        onPress={handleCenterLocation}
      >
        <Feather name="crosshair" size={24} color={theme.primary} />
      </Pressable>

      {selectedVehicle ? (
        <Card
          style={{ ...styles.vehicleCard, bottom: insets.bottom + Spacing.lg } as ViewStyle}
        >
          <Pressable onPress={handleVehiclePress} style={styles.vehicleCardContent}>
            <Image
              source={{ uri: selectedVehicle.imageUrl }}
              style={styles.vehicleImage}
              contentFit="cover"
            />
            <View style={styles.vehicleInfo}>
              <ThemedText type="h4" numberOfLines={1}>
                {selectedVehicle.name}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
                numberOfLines={1}
              >
                {selectedVehicle.location?.address}
              </ThemedText>
              <View style={styles.vehicleDetails}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color="#F7B801" />
                  <ThemedText type="small" style={{ marginLeft: 4 }}>
                    {selectedVehicle.rating}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  ${selectedVehicle.pricePerHour}/hr
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(selectedVehicle.id)}
            >
              <Feather
                name={isFavorite(selectedVehicle.id) ? "heart" : "heart"}
                size={20}
                color={isFavorite(selectedVehicle.id) ? Colors.light.error : theme.textSecondary}
              />
            </Pressable>
          </Pressable>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  backToListButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  markerPrice: {
    fontSize: 12,
    fontWeight: "700",
  },
  vehicleCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
  },
  vehicleCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  vehicleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    padding: Spacing.sm,
  },
  webFallbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  webFallbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  webVehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  webVehicleImage: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  webVehicleInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
