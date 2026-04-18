import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useFavorites } from "@/hooks/useFavorites";
import { useVehicle } from "@/hooks/useVehicles";
import { useAuth } from "@/hooks/useAuth";
import { useCreateConversation } from "@/hooks/useMessages";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "VehicleDetail">;

export default function VehicleDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: vehicle, isLoading } = useVehicle(route.params.vehicleId);
  const { user, isAuthenticated } = useAuth();
  const createConversation = useCreateConversation();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContactHost = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !vehicle?.ownerId) {
      navigation.navigate("Auth");
      return;
    }
    
    try {
      const conversation = await createConversation.mutateAsync({
        renterId: user.id,
        ownerId: vehicle.ownerId,
        vehicleId: vehicle.id,
      });
      navigation.navigate("Chat", { conversationId: conversation.id });
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }, [isAuthenticated, user?.id, vehicle?.ownerId, vehicle?.id, navigation, createConversation]);

  const handleFavorite = useCallback(() => {
    if (vehicle) {
      toggleFavorite(vehicle.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [vehicle, toggleFavorite]);

  const handleBook = useCallback(() => {
    if (vehicle) {
      navigation.navigate("Booking", { vehicleId: vehicle.id });
    }
  }, [vehicle, navigation]);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.errorContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading vehicle...</ThemedText>
      </ThemedView>
    );
  }

  if (!vehicle) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <ThemedText type="h2">Vehicle not found</ThemedText>
          <Button onPress={handleBack} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  const isFav = isFavorite(vehicle.id);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <Pressable
            onPress={handleBack}
            style={[
              styles.floatingButton,
              styles.backFloatingButton,
              { backgroundColor: theme.backgroundRoot, top: insets.top + Spacing.md },
            ]}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={handleFavorite}
            style={[
              styles.floatingButton,
              styles.favoriteFloatingButton,
              { backgroundColor: theme.backgroundRoot, top: insets.top + Spacing.md },
            ]}
          >
            <AntDesign
              name={isFav ? "heart" : "hearto"}
              size={24}
              color={isFav ? Colors.light.error : theme.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <ThemedText type="h1">{vehicle.name}</ThemedText>
              <View style={styles.ratingRow}>
                <Feather name="star" size={16} color={Colors.light.accent} />
                <ThemedText type="body" style={styles.ratingText}>
                  {vehicle.rating.toFixed(1)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  ({vehicle.reviewCount} reviews)
                </ThemedText>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText type="h2" style={{ color: Colors.light.primary }}>
                ${vehicle.pricePerHour}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                per hour
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statsRow, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.statItem}>
              <Feather name="users" size={20} color={Colors.light.primary} />
              <ThemedText type="small" style={styles.statValue}>
                {vehicle.seats} seats
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather
                name={vehicle.fuelType === "electric" ? "zap" : "droplet"}
                size={20}
                color={Colors.light.primary}
              />
              <ThemedText type="small" style={styles.statValue}>
                {vehicle.fuelType}
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="settings" size={20} color={Colors.light.primary} />
              <ThemedText type="small" style={styles.statValue}>
                {vehicle.transmission}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="h3" style={styles.sectionTitle}>
            Features
          </ThemedText>
          <View style={styles.featuresGrid}>
            {vehicle.features.map((feature) => (
              <View
                key={feature}
                style={[styles.featureItem, { backgroundColor: theme.backgroundDefault }]}
              >
                <Feather name="check" size={16} color={Colors.light.success} />
                <ThemedText type="small">{feature}</ThemedText>
              </View>
            ))}
          </View>

          <ThemedText type="h3" style={styles.sectionTitle}>
            Location
          </ThemedText>
          <View style={[styles.locationCard, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="map-pin" size={20} color={Colors.light.primary} />
            <View style={styles.locationContent}>
              <ThemedText type="body">{vehicle.location.address}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {vehicle.distance.toFixed(1)} miles away
              </ThemedText>
            </View>
          </View>
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
        <View style={styles.bottomPriceContainer}>
          <ThemedText type="h2" style={{ color: Colors.light.primary }}>
            ${vehicle.pricePerHour}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            per hour
          </ThemedText>
        </View>
        <Pressable
          onPress={handleContactHost}
          style={[styles.contactButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="message-circle" size={24} color={theme.primary} />
        </Pressable>
        <Button onPress={handleBook} style={styles.bookButton}>
          Book Now
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
  heroContainer: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  floatingButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  backFloatingButton: {
    left: Spacing.lg,
  },
  favoriteFloatingButton: {
    right: Spacing.lg,
  },
  content: {
    padding: Spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  ratingText: {
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  statsRow: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    fontWeight: "500",
    textTransform: "capitalize",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  locationContent: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  bottomPriceContainer: {
    alignItems: "flex-start",
  },
  bookButton: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
});
