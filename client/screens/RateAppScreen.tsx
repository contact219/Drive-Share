import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, TextInput, Alert } from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function RateAppScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = useCallback(() => {
    if (rating === 0) {
      Alert.alert("Please Rate", "Please select a star rating before submitting.");
      return;
    }
    Alert.alert(
      "Thank You!",
      "Your feedback helps us improve Rush. In a production app, this would open the App Store for a review.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }, [rating, navigation]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">Rate Rush</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ratingSection}>
          <ThemedText type="h2" style={styles.ratingTitle}>
            Enjoying Rush?
          </ThemedText>
          <ThemedText type="body" style={[styles.ratingSubtitle, { color: theme.textSecondary }]}>
            Tap a star to rate your experience
          </ThemedText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Feather
                  name="star"
                  size={48}
                  color={star <= rating ? Colors.light.accent : theme.textSecondary}
                  style={star <= rating ? { opacity: 1 } : { opacity: 0.3 }}
                />
              </Pressable>
            ))}
          </View>

          {rating > 0 ? (
            <ThemedText type="h4" style={[styles.ratingText, { color: Colors.light.primary }]}>
              {rating === 5 ? "Amazing!" : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.feedbackSection, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.feedbackLabel}>
            Additional Feedback (Optional)
          </ThemedText>
          <TextInput
            style={[
              styles.feedbackInput,
              { color: theme.text, borderColor: theme.textSecondary },
            ]}
            placeholder="Tell us what you love or how we can improve..."
            placeholderTextColor={theme.textSecondary}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Button
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Submit Rating
        </Button>

        <Pressable style={styles.laterButton} onPress={() => navigation.goBack()}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Maybe Later
          </ThemedText>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
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
    paddingTop: Spacing.xl,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  ratingTitle: {
    textAlign: "center",
  },
  ratingSubtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  starButton: {
    padding: Spacing.xs,
  },
  ratingText: {
    marginTop: Spacing.lg,
  },
  feedbackSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  feedbackLabel: {
    marginBottom: Spacing.md,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 16,
  },
  submitButton: {
    marginBottom: Spacing.md,
  },
  laterButton: {
    alignItems: "center",
    padding: Spacing.md,
  },
});
