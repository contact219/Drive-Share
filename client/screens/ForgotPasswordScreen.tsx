import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { getApiUrl } from "@/lib/query-client";

type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/auth/forgot-password", baseUrl);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Check Your Email",
        "If an account exists with that email, we've sent a password reset code. Check your inbox and enter the code below.",
        [{ text: "OK", onPress: () => setStep("reset") }]
      );
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleResetPassword = useCallback(async () => {
    if (!token.trim()) {
      Alert.alert("Missing Code", "Please enter the reset code from your email.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure your passwords match.");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/auth/reset-password", baseUrl);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset failed");
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Password Reset",
        "Your password has been reset successfully. You can now sign in with your new password.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password";
      if (message.includes("Invalid") || message.includes("expired")) {
        Alert.alert("Invalid Code", "The reset code is invalid or has expired. Please request a new one.");
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, newPassword, confirmPassword, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton} hitSlop={8}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>

        {step === "email" ? (
          <>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="mail" size={32} color={Colors.light.primary} />
              </View>
            </View>

            <View style={styles.header}>
              <ThemedText type="h1" style={styles.title}>
                Forgot Password?
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                Enter the email address associated with your account and we'll send you a code to reset your password.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText type="body" style={styles.label}>
                  Email Address
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Feather name="mail" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>
              </View>

              <Button
                onPress={handleSendResetEmail}
                style={styles.submitButton}
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>

              <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
                <Feather name="arrow-left" size={16} color={Colors.light.primary} />
                <ThemedText type="body" style={{ color: Colors.light.primary, marginLeft: Spacing.xs }}>
                  Back to Sign In
                </ThemedText>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="key" size={32} color={Colors.light.primary} />
              </View>
            </View>

            <View style={styles.header}>
              <ThemedText type="h1" style={styles.title}>
                Reset Password
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                Enter the reset code from your email and choose a new password.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText type="body" style={styles.label}>
                  Reset Code
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Feather name="hash" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Paste the code from your email"
                    placeholderTextColor={theme.textSecondary}
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText type="body" style={styles.label}>
                  New Password
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Feather name="lock" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="At least 6 characters"
                    placeholderTextColor={theme.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={8}>
                    <Feather
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText type="body" style={styles.label}>
                  Confirm Password
                </ThemedText>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Feather name="lock" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Re-enter new password"
                    placeholderTextColor={theme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8}>
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <Button
                onPress={handleResetPassword}
                style={styles.submitButton}
                disabled={!token.trim() || newPassword.length < 6 || newPassword !== confirmPassword || isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <Pressable onPress={() => setStep("email")} style={styles.backLink}>
                <Feather name="arrow-left" size={16} color={Colors.light.primary} />
                <ThemedText type="body" style={{ color: Colors.light.primary, marginLeft: Spacing.xs }}>
                  Resend Code
                </ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
});
