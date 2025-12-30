import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "apple_pay";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true },
  { id: "2", type: "mastercard", last4: "8888", expiry: "03/25", isDefault: false },
];

function getCardIcon(type: PaymentMethod["type"]) {
  switch (type) {
    case "visa":
      return "credit-card";
    case "mastercard":
      return "credit-card";
    case "amex":
      return "credit-card";
    case "apple_pay":
      return "smartphone";
    default:
      return "credit-card";
  }
}

function getCardName(type: PaymentMethod["type"]) {
  switch (type) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    case "apple_pay":
      return "Apple Pay";
    default:
      return "Card";
  }
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);

  const handleAddCard = useCallback(() => {
    Alert.alert(
      "Add Payment Method",
      "In a production app, this would open a secure card entry form powered by Stripe or similar payment processor.",
      [{ text: "OK" }]
    );
  }, []);

  const handleSetDefault = useCallback((id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
          },
        },
      ]
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Payment Methods</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="credit-card" size={64} color={theme.textSecondary} />
            <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No Payment Methods
            </ThemedText>
            <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
              Add a card to start booking vehicles
            </ThemedText>
          </View>
        ) : (
          paymentMethods.map((pm) => (
            <Pressable
              key={pm.id}
              style={[
                styles.cardItem,
                { backgroundColor: theme.backgroundDefault },
                pm.isDefault && { borderColor: Colors.light.primary, borderWidth: 2 },
              ]}
              onPress={() => handleSetDefault(pm.id)}
            >
              <View style={styles.cardIcon}>
                <Feather name={getCardIcon(pm.type)} size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.cardInfo}>
                <ThemedText type="h4">
                  {getCardName(pm.type)} ****{pm.last4}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Expires {pm.expiry}
                </ThemedText>
              </View>
              {pm.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: Colors.light.primary }]}>
                  <ThemedText type="small" style={{ color: "#fff" }}>Default</ThemedText>
                </View>
              ) : (
                <Pressable onPress={() => handleRemoveCard(pm.id)} hitSlop={8}>
                  <Feather name="trash-2" size={20} color={theme.textSecondary} />
                </Pressable>
              )}
            </Pressable>
          ))
        )}

        <Button
          onPress={handleAddCard}
          style={styles.addButton}
        >
          Add Payment Method
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
    paddingTop: Spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  addButton: {
    marginTop: Spacing.lg,
  },
});
