import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.header}>
        <Feather name="arrow-left" size={24} color={theme.text} />
        <ThemedText type="h3" style={styles.title}>
          Privacy Policy
        </ThemedText>
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="body" style={styles.lastUpdated}>
          Last updated: December 30, 2025
        </ThemedText>

        <Section title="1. Introduction">
          Rush ("we" or "us" or "our") operates the Rush mobile application
          (the "App"). This page informs you of our policies regarding the
          collection, use, and disclosure of personal data when you use our App
          and the choices you have associated with that data.
        </Section>

        <Section title="2. Information Collection and Use">
          We collect several different types of information for various purposes
          to provide and improve our App to you.
        </Section>

        <SubSection title="Types of Data Collected:">
          <BulletList
            items={[
              "Account Information: Name, email address, phone number, password",
              "Profile Data: Profile picture, rating, trip history, preferences",
              "Location Data: Your current location when using our services",
              "Payment Information: Processed securely by third-party providers",
              "Usage Data: How you use the App, features accessed, time spent",
            ]}
          />
        </SubSection>

        <Section title="3. Use of Data">
          Rush uses the collected data for various purposes:
        </Section>

        <BulletList
          items={[
            "To provide and maintain our App",
            "To notify you about changes to our App",
            "To allow you to participate in interactive features of our App",
            "To provide customer support",
            "To gather analysis or valuable information so we can improve our App",
            "To monitor the usage of our App",
          ]}
        />

        <Section title="4. Security of Data">
          The security of your data is important to us but remember that no
          method of transmission over the Internet or method of electronic
          storage is 100% secure. While we strive to use commercially acceptable
          means to protect your Personal Data, we cannot guarantee its absolute
          security.
        </Section>

        <Section title="5. Your Rights">
          You have the right to:
        </Section>

        <BulletList
          items={[
            "Access your personal data",
            "Correct inaccurate data",
            "Request deletion of your data",
            "Export your data",
            "Opt-out of marketing communications",
          ]}
        />

        <Section title="6. Changes to This Privacy Policy">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "effective date" at the top of this Privacy Policy.
        </Section>

        <Section title="7. Contact Us">
          If you have any questions about this Privacy Policy, please contact us
          at support@rush.app
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <ThemedText type="h5" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText type="body" style={styles.sectionText}>
        {children}
      </ThemedText>
    </>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <ThemedText type="body" style={[styles.sectionText, { fontWeight: "600" }]}>
        {title}
      </ThemedText>
      {children}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <ThemedText key={index} type="body" style={styles.bulletItem}>
          • {item}
        </ThemedText>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  sectionText: {
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  bulletItem: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
});
