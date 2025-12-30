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

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.header}>
        <Feather name="arrow-left" size={24} color={theme.text} />
        <ThemedText type="h3" style={styles.title}>
          Terms of Service
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

        <Section title="1. Acceptance of Terms">
          By accessing and using the Rush mobile application (the "App"), you
          accept and agree to be bound by the terms and provision of this
          agreement.
        </Section>

        <Section title="2. Use License">
          Permission is granted to temporarily download one copy of the
          materials (information or software) on Rush for personal,
          non-commercial transitory viewing only. This is the grant of a license,
          not a transfer of title, and under this license you may not:
        </Section>

        <BulletList
          items={[
            "Modifying or copying the materials",
            "Using the materials for any commercial purpose or for any public display",
            "Attempting to decompile or reverse engineer any software contained on the App",
            "Removing any copyright or other proprietary notations from the materials",
            "Transferring the materials to another person or 'mirroring' the materials on any other server",
          ]}
        />

        <Section title="3. Disclaimer">
          The materials on Rush's App are provided on an 'as is' basis. Rush
          makes no warranties, expressed or implied, and hereby disclaims and
          negates all other warranties including, without limitation, implied
          warranties or conditions of merchantability, fitness for a particular
          purpose, or non-infringement of intellectual property or other
          violation of rights.
        </Section>

        <Section title="4. Limitations">
          In no event shall Rush or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on Rush's App, even if Rush or an authorized
          representative has been notified orally or in writing of the
          possibility of such damage.
        </Section>

        <Section title="5. Accuracy of Materials">
          The materials appearing on Rush's App could include technical,
          typographical, or photographic errors. Rush does not warrant that any
          of the materials on its App are accurate, complete, or current. Rush
          may make changes to the materials contained on its App at any time
          without notice.
        </Section>

        <Section title="6. Links">
          Rush has not reviewed all of the sites linked to its App and is not
          responsible for the contents of any such linked site. The inclusion of
          any link does not imply endorsement by Rush of the site. Use of any
          such linked website is at the user's own risk.
        </Section>

        <Section title="7. Modifications">
          Rush may revise these terms of service for its App at any time without
          notice. By using this App, you are agreeing to be bound by the then
          current version of these terms of service.
        </Section>

        <Section title="8. Governing Law">
          These terms and conditions are governed by and construed in accordance
          with the laws of the United States, and you irrevocably submit to the
          exclusive jurisdiction of the courts in that location.
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
