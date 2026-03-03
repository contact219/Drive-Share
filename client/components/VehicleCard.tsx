import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Vehicle } from "@/types";
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@/lib/i18n";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
  compact?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VehicleCard({
  vehicle,
  onPress,
  onFavoritePress,
  isFavorite,
  compact = false,
}: VehicleCardProps) {
  const { theme, isDark } = useTheme();
  const { settings } = useSettings();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  if (compact) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.compactCard,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri: vehicle.imageUrl }}
          style={styles.compactImage}
          contentFit="cover"
        />
        <Pressable
          onPress={onFavoritePress}
          style={styles.compactFavoriteButton}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? Colors.light.error : theme.textSecondary}
          />
        </Pressable>
        <View style={styles.compactContent}>
          <ThemedText type="small" numberOfLines={1} style={styles.compactName}>
            {vehicle.name}
          </ThemedText>
          <View style={styles.compactPriceRow}>
            <ThemedText type="h4" style={{ color: Colors.light.primary }}>
              ${vehicle.pricePerHour}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              /hr
            </ThemedText>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <Pressable
          onPress={onFavoritePress}
          style={[styles.favoriteButton, { backgroundColor: theme.backgroundRoot }]}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? Colors.light.error : theme.textSecondary}
          />
        </Pressable>
        <View style={[styles.typeBadge, { backgroundColor: Colors.light.primary }]}>
          <ThemedText type="caption" style={styles.typeBadgeText}>
            {vehicle.type.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="h4" numberOfLines={1} style={styles.name}>
            {vehicle.name}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color={Colors.light.accent} />
            <ThemedText type="small" style={styles.rating}>
              {vehicle.rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {vehicle.distance.toFixed(1)} mi
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Feather name="users" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {vehicle.seats} {t("vehicle_seats", settings.language)}
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Feather
              name={vehicle.fuelType === "electric" ? "zap" : "droplet"}
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {vehicle.fuelType}
            </ThemedText>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <ThemedText type="h3" style={{ color: Colors.light.primary }}>
              ${vehicle.pricePerHour}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t("vehicle_per_hour", settings.language)}
            </ThemedText>
          </View>
          <View
            style={[
              styles.bookButton,
              { backgroundColor: Colors.light.primary },
            ]}
          >
            <ThemedText type="small" style={styles.bookButtonText}>
              {t("vehicle_view_details", settings.language)}
            </ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  typeBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 10,
  },
  content: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  bookButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  compactCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    flex: 1,
    margin: Spacing.xs,
  },
  compactImage: {
    width: "100%",
    height: 120,
  },
  compactFavoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  compactContent: {
    padding: Spacing.md,
  },
  compactName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  compactPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
});
