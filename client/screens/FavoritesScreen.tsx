import React, { useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { VehicleCard } from "@/components/VehicleCard";
import { EmptyState } from "@/components/EmptyState";
import { useFavorites } from "@/hooks/useFavorites";
import { useVehicles } from "@/hooks/useVehicles";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Vehicle } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { data: vehicles = [], isLoading } = useVehicles();
  const { theme } = useTheme();

  const favoriteVehicles = useMemo(() => {
    return vehicles.filter((v) => favorites.includes(v.id));
  }, [vehicles, favorites]);

  const handleVehiclePress = useCallback(
    (vehicle: Vehicle) => {
      navigation.navigate("VehicleDetail", { vehicleId: vehicle.id });
    },
    [navigation]
  );

  const handleBrowse = useCallback(() => {
    navigation.getParent()?.navigate("Browse");
  }, [navigation]);

  const renderVehicle = useCallback(
    ({ item, index }: { item: Vehicle; index: number }) => (
      <View style={[styles.gridItem, index % 2 === 0 ? styles.leftItem : styles.rightItem]}>
        <VehicleCard
          vehicle={item}
          onPress={() => handleVehiclePress(item)}
          onFavoritePress={() => toggleFavorite(item.id)}
          isFavorite={isFavorite(item.id)}
          compact
        />
      </View>
    ),
    [handleVehiclePress, toggleFavorite, isFavorite]
  );

  const keyExtractor = useCallback((item: Vehicle) => item.id, []);

  const ListEmpty = (
    <EmptyState
      icon="heart"
      title="No Favorites Yet"
      message="Save vehicles you like by tapping the heart icon while browsing."
      actionLabel="Browse Vehicles"
      onAction={handleBrowse}
    />
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading favorites...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.xl },
        ]}
      >
        <ThemedText type="h1">Favorites</ThemedText>
        {favoriteVehicles.length > 0 ? (
          <ThemedText type="small" style={styles.count}>
            {favoriteVehicles.length} saved vehicle{favoriteVehicles.length !== 1 ? "s" : ""}
          </ThemedText>
        ) : null}
      </View>
      <FlatList
        data={favoriteVehicles}
        renderItem={renderVehicle}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          favoriteVehicles.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  count: {
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    maxWidth: "50%",
  },
  leftItem: {
    paddingRight: Spacing.xs,
  },
  rightItem: {
    paddingLeft: Spacing.xs,
  },
});
