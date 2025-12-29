import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Colors, BorderRadius } from "@/constants/theme";

interface AvatarProps {
  index: number;
  size?: number;
}

const AVATAR_COLORS = [
  { bg: "#FFE4D6", fg: Colors.light.primary },
  { bg: "#D6E4FF", fg: Colors.light.secondary },
  { bg: "#D6FFE4", fg: Colors.light.success },
  { bg: "#FFD6E4", fg: Colors.light.error },
];

export function Avatar({ index, size = 80 }: AvatarProps) {
  const { theme } = useTheme();
  const colorSet = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colorSet.bg,
        },
      ]}
    >
      <Feather name="user" size={size * 0.5} color={colorSet.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
