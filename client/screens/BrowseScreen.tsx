import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { VehicleCard } from "@/components/VehicleCard";
import { SearchBar } from "@/components/SearchBar";
import { CategoryChip } from "@/components/CategoryChip";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useFavorites } from "@/hooks/useFavorites";
import { useVehicles } from "@/hooks/useVehicles";
import { Colors, Spacing } from "@/constants/theme";
import { VEHICLE_TYPES, Vehicle } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function filterVehicles(
  vehicles: Vehicle[],
  filters: { search?: string; types?: string[] }
): Vehicle[] {
  return vehicles.filter((v) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(v.type)) return false;
    }
    return true;
  });
}

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: vehicles = [], isLoading } = useVehicles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredVehicles = useMemo(() => {
    return filterVehicles(vehicles, {
      search: searchQuery,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
    });
  }, [vehicles, searchQuery, selectedTypes]);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleVehiclePress = useCallback(
    (vehicle: Vehicle) => {
      navigation.navigate("VehicleDetail", { vehicleId: vehicle.id });
    },
    [navigation]
  );

  const handleFilterPress = useCallback(() => {
    navigation.navigate("Filter");
  }, [navigation]);

  const renderVehicle = useCallback(
    ({ item }: { item: Vehicle }) => (
      <VehicleCard
        vehicle={item}
        onPress={() => handleVehiclePress(item)}
        onFavoritePress={() => toggleFavorite(item.id)}
        isFavorite={isFavorite(item.id)}
      />
    ),
    [handleVehiclePress, toggleFavorite, isFavorite]
  );

  const keyExtractor = useCallback((item: Vehicle) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h1">Find Your Ride</ThemedText>
        </View>
        <View style={styles.locationRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            San Francisco, CA
          </ThemedText>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={handleFilterPress}
          placeholder="Search by make, model..."
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          {VEHICLE_TYPES.map((type) => (
            <CategoryChip
              key={type.value}
              label={type.label}
              isSelected={selectedTypes.includes(type.value)}
              onPress={() => handleTypeToggle(type.value)}
            />
          ))}
        </ScrollView>
        <View style={styles.resultsRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {filteredVehicles.length} vehicles available
          </ThemedText>
        </View>
      </View>
    ),
    [
      searchQuery,
      selectedTypes,
      filteredVehicles.length,
      theme.textSecondary,
      handleFilterPress,
      handleTypeToggle,
    ]
  );

  const ListEmpty = useMemo(
    () => (
      <EmptyState
        icon="search"
        title="No Vehicles Found"
        message="Try adjusting your search or filters to find more vehicles."
        actionLabel="Clear Filters"
        onAction={() => {
          setSearchQuery("");
          setSelectedTypes([]);
        }}
      />
    ),
    []
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading vehicles...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicle}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  chipScroll: {
    marginTop: Spacing.lg,
    marginHorizontal: -Spacing.xl,
  },
  chipContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  resultsRow: {
    marginTop: Spacing.md,
  },
});
