import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "How do I book a vehicle?",
    answer: "Browse available vehicles, select one you like, choose your dates and times, then confirm your booking. Payment will be processed automatically.",
  },
  {
    id: "2",
    question: "What's included in the rental?",
    answer: "All rentals include insurance, roadside assistance, and unlimited mileage. Fuel is not included - please return the vehicle with the same fuel level.",
  },
  {
    id: "3",
    question: "How do I unlock the vehicle?",
    answer: "Once your trip begins, use the Rush app to unlock the vehicle. Make sure Bluetooth is enabled on your device.",
  },
  {
    id: "4",
    question: "What if I need to cancel?",
    answer: "You can cancel for free up to 24 hours before your trip. Cancellations within 24 hours may incur a fee.",
  },
  {
    id: "5",
    question: "What happens if I have an accident?",
    answer: "Contact our 24/7 support immediately. All vehicles are insured, and we'll guide you through the process.",
  },
];

const CONTACT_OPTIONS = [
  { id: "email", icon: "mail", title: "Email Support", subtitle: "support@rush.app" },
  { id: "phone", icon: "phone", title: "Call Us", subtitle: "1-800-RUSH-CAR" },
  { id: "chat", icon: "message-circle", title: "Live Chat", subtitle: "Available 24/7" },
];

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = useCallback((id: string) => {
    setExpandedFAQ(prev => (prev === id ? null : id));
  }, []);

  const handleContact = useCallback((type: string) => {
    switch (type) {
      case "email":
        Linking.openURL("mailto:support@rush.app");
        break;
      case "phone":
        Linking.openURL("tel:1-800-787-4227");
        break;
      case "chat":
        Alert.alert("Live Chat", "Live chat support would open here in a production app.");
        break;
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Help & Support</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Contact Us
        </ThemedText>

        <View style={styles.contactGrid}>
          {CONTACT_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.contactCard, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => handleContact(option.id)}
            >
              <View style={[styles.contactIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name={option.icon as any} size={24} color={Colors.light.primary} />
              </View>
              <ThemedText type="h4">{option.title}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {option.subtitle}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Frequently Asked Questions
        </ThemedText>

        {FAQ_ITEMS.map((faq) => (
          <Pressable
            key={faq.id}
            style={[styles.faqItem, { backgroundColor: theme.backgroundDefault }]}
            onPress={() => toggleFAQ(faq.id)}
          >
            <View style={styles.faqHeader}>
              <ThemedText type="h4" style={styles.faqQuestion}>
                {faq.question}
              </ThemedText>
              <Feather
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </View>
            {expandedFAQ === faq.id ? (
              <ThemedText type="body" style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                {faq.answer}
              </ThemedText>
            ) : null}
          </Pressable>
        ))}

        <View style={[styles.emergencyCard, { backgroundColor: Colors.light.error + "15" }]}>
          <Feather name="alert-triangle" size={24} color={Colors.light.error} />
          <View style={styles.emergencyContent}>
            <ThemedText type="h4">Emergency Assistance</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              For roadside emergencies, call our 24/7 hotline or use the SOS button in the app during an active trip.
            </ThemedText>
          </View>
        </View>
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
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  contactGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  contactCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  faqItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    flex: 1,
    marginRight: Spacing.md,
  },
  faqAnswer: {
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  emergencyCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
