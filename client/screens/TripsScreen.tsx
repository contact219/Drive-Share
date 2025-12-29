import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TripCard } from "@/components/TripCard";
import { SegmentControl } from "@/components/SegmentControl";
import { EmptyState } from "@/components/EmptyState";
import { useTrips } from "@/hooks/useTrips";
import { Spacing } from "@/constants/theme";
import { Trip } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { upcomingTrips, pastTrips, isLoading, updateTrip } = useTrips();

  const [selectedSegment, setSelectedSegment] = useState(0);

  const trips = selectedSegment === 0 ? upcomingTrips : pastTrips;

  const handleTripPress = useCallback((trip: Trip) => {
    if (trip.status === "active") {
      navigation.navigate("ActiveTrip", { tripId: trip.id });
    } else {
      navigation.navigate("VehicleDetail", { vehicleId: trip.vehicleId });
    }
  }, [navigation]);

  const handleTripAction = useCallback(
    async (trip: Trip) => {
      if (trip.status === "upcoming") {
        await updateTrip(trip.id, { status: "active" });
        navigation.navigate("ActiveTrip", { tripId: trip.id });
      } else if (trip.status === "active") {
        navigation.navigate("ActiveTrip", { tripId: trip.id });
      } else if (trip.status === "completed") {
        navigation.navigate("Booking", { vehicleId: trip.vehicleId });
      }
    },
    [navigation, updateTrip]
  );

  const renderTrip = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard
        trip={item}
        onPress={() => handleTripPress(item)}
        onActionPress={() => handleTripAction(item)}
      />
    ),
    [handleTripPress, handleTripAction]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const ListEmpty = (
    <EmptyState
      icon={selectedSegment === 0 ? "calendar" : "clock"}
      title={selectedSegment === 0 ? "No Upcoming Trips" : "No Past Trips"}
      message={
        selectedSegment === 0
          ? "Book your first vehicle to get started!"
          : "Your completed trips will appear here."
      }
      actionLabel={selectedSegment === 0 ? "Browse Vehicles" : undefined}
      onAction={
        selectedSegment === 0
          ? () => navigation.getParent()?.navigate("Browse")
          : undefined
      }
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.xl },
        ]}
      >
        <ThemedText type="h1" style={styles.title}>
          My Trips
        </ThemedText>
        <SegmentControl
          segments={["Upcoming", "Past"]}
          selectedIndex={selectedSegment}
          onSelect={setSelectedSegment}
        />
      </View>
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          trips.length === 0 && styles.emptyList,
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
  },
});
