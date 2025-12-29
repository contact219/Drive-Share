import React, { useState, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = isLogin
    ? email.length > 0 && password.length >= 6
    : email.length > 0 && password.length >= 6 && name.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert("Invalid Form", "Please fill in all fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login(email, name || email.split("@")[0]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, email, name, login, navigation]);

  const handleSocialAuth = useCallback((provider: string) => {
    Alert.alert(
      "Coming Soon",
      `${provider} sign-in will be available in a future update.`
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          hitSlop={8}
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.header}>
          <ThemedText type="h1" style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {isLogin
              ? "Sign in to continue booking vehicles"
              : "Join Rush to start renting vehicles"}
          </ThemedText>
        </View>

        <View style={styles.socialButtons}>
          <Pressable
            onPress={() => handleSocialAuth("Apple")}
            style={[styles.socialButton, { backgroundColor: theme.text }]}
          >
            <Feather name="smartphone" size={20} color={theme.backgroundRoot} />
            <ThemedText type="body" style={{ color: theme.backgroundRoot, marginLeft: Spacing.sm }}>
              Continue with Apple
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleSocialAuth("Google")}
            style={[styles.socialButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="mail" size={20} color={theme.text} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              Continue with Google
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginHorizontal: Spacing.md }}>
            or
          </ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.form}>
          {!isLogin ? (
            <View style={styles.inputContainer}>
              <ThemedText type="small" style={styles.inputLabel}>
                Full Name
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="user" size={20} color={theme.textSecondary} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                  autoCapitalize="words"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.inputLabel}>
              Email Address
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.inputLabel}>
              Password
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Button
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={!isFormValid || isLoading}
          >
            {isLoading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </Button>
        </View>

        <View style={styles.footer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </ThemedText>
          <Pressable onPress={() => setIsLogin(!isLogin)}>
            <ThemedText type="body" style={{ color: Colors.light.primary, fontWeight: "600" }}>
              {isLogin ? "Sign Up" : "Sign In"}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="caption" style={[styles.terms, { color: theme.textSecondary }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
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
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  terms: {
    textAlign: "center",
    lineHeight: 18,
  },
});
