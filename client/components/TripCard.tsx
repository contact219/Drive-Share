import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onActionPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TripCard({ trip, onPress, onActionPress }: TripCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getStatusColor = () => {
    switch (trip.status) {
      case "upcoming":
        return Colors.light.primary;
      case "active":
        return Colors.light.success;
      case "completed":
        return Colors.light.secondary;
      case "cancelled":
        return Colors.light.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (trip.status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return trip.status;
    }
  };

  const getActionButton = () => {
    switch (trip.status) {
      case "upcoming":
        return { label: "Start Trip", icon: "play" as const };
      case "active":
        return { label: "View Trip", icon: "navigation" as const };
      case "completed":
        return { label: "Book Again", icon: "repeat" as const };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();

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
      <View style={styles.row}>
        <Image
          source={{ uri: trip.vehicle.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="h4" numberOfLines={1} style={styles.vehicleName}>
              {trip.vehicle.name}
            </ThemedText>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
            >
              <ThemedText type="caption" style={styles.statusText}>
                {getStatusLabel()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Feather name="calendar" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatDate(trip.startDate)}
            </ThemedText>
          </View>

          <View style={styles.timeRow}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatTime(trip.startDate)} - {formatTime(trip.endDate)}
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <ThemedText type="h4" style={{ color: Colors.light.primary }}>
              ${trip.totalCost.toFixed(2)}
            </ThemedText>
            {actionButton && onActionPress ? (
              <Pressable
                onPress={onActionPress}
                style={[
                  styles.actionButton,
                  { backgroundColor: Colors.light.primary },
                ]}
                hitSlop={8}
              >
                <Feather name={actionButton.icon} size={14} color="#FFFFFF" />
                <ThemedText type="caption" style={styles.actionButtonText}>
                  {actionButton.label}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  vehicleName: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
