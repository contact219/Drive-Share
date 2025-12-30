import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface DataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
}

export default function DataDownloadScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const [categories, setCategories] = useState<DataCategory[]>([
    { id: "profile", title: "Profile Information", description: "Name, email, phone, preferences", icon: "user", selected: true },
    { id: "trips", title: "Trip History", description: "All your past and upcoming trips", icon: "map", selected: true },
    { id: "payments", title: "Payment History", description: "Transaction records and receipts", icon: "credit-card", selected: true },
    { id: "favorites", title: "Saved Vehicles", description: "Your favorited vehicles", icon: "heart", selected: false },
    { id: "messages", title: "Messages", description: "Support conversations", icon: "message-circle", selected: false },
  ]);

  const toggleCategory = useCallback((id: string) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, selected: !cat.selected } : cat))
    );
  }, []);

  const handleRequestData = useCallback(() => {
    const selectedCount = categories.filter(c => c.selected).length;
    if (selectedCount === 0) {
      Alert.alert("Select Data", "Please select at least one data category to download.");
      return;
    }

    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      Alert.alert(
        "Request Submitted",
        "We'll prepare your data and send a download link to your email within 48 hours.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 2000);
  }, [categories, navigation]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Download My Data</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="download-cloud" size={32} color={Colors.light.primary} />
          <ThemedText type="body" style={[styles.infoText, { color: theme.textSecondary }]}>
            Request a copy of your personal data. We'll compile it and send a secure download link to {user?.email || "your email"}.
          </ThemedText>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Select Data to Include
        </ThemedText>

        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryItem,
              { backgroundColor: theme.backgroundDefault },
              category.selected && { borderColor: Colors.light.primary, borderWidth: 2 },
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name={category.icon as any} size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.categoryInfo}>
              <ThemedText type="h4">{category.title}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {category.description}
              </ThemedText>
            </View>
            <Feather
              name={category.selected ? "check-square" : "square"}
              size={24}
              color={category.selected ? Colors.light.primary : theme.textSecondary}
            />
          </Pressable>
        ))}

        <View style={[styles.noteCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="clock" size={20} color={theme.textSecondary} />
          <View style={styles.noteContent}>
            <ThemedText type="h4">Processing Time</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              Your data request will be processed within 48 hours. You'll receive an email with a secure download link.
            </ThemedText>
          </View>
        </View>

        <Button
          onPress={handleRequestData}
          style={styles.requestButton}
          disabled={isRequesting}
        >
          {isRequesting ? "Requesting..." : "Request Data Download"}
        </Button>
      </ScrollView>
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
  infoCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  infoText: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  noteCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  noteContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  requestButton: {
    marginTop: Spacing.xl,
  },
});
