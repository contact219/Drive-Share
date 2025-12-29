import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SegmentControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentControl({
  segments,
  selectedIndex,
  onSelect,
}: SegmentControlProps) {
  const { theme } = useTheme();

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: withTiming(`${(selectedIndex / segments.length) * 100}%`, {
      duration: 200,
    }),
    width: `${100 / segments.length}%`,
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: Colors.light.primary },
          animatedIndicatorStyle,
        ]}
      />
      {segments.map((segment, index) => (
        <Pressable
          key={segment}
          onPress={() => onSelect(index)}
          style={styles.segment}
        >
          <ThemedText
            type="small"
            style={[
              styles.segmentText,
              {
                color: selectedIndex === index ? "#FFFFFF" : theme.text,
                fontWeight: selectedIndex === index ? "600" : "400",
              },
            ]}
          >
            {segment}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: Spacing.xs,
    bottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  segmentText: {
    textAlign: "center",
  },
});
