import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import "react-native-get-random-values";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
};

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { login, register, socialLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [socialMessage, setSocialMessage] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "rush-enterprise",
  });

  const [googleRequest, googleResponse, promptGoogleAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID || "",
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    googleDiscovery
  );

  useEffect(() => {
    if (googleResponse?.type === "success" && googleResponse.authentication?.accessToken) {
      handleGoogleToken(googleResponse.authentication.accessToken);
    }
  }, [googleResponse]);

  const handleGoogleToken = async (accessToken: string) => {
    setSocialLoading("Google");
    try {
      await socialLogin("google", accessToken);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      Alert.alert("Error", message);
    } finally {
      setSocialLoading(null);
    }
  };

  const showSocialMessage = (msg: string) => {
    setSocialMessage(msg);
    setTimeout(() => setSocialMessage(null), 5000);
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") {
      showSocialMessage("Apple Sign-In is only available on iOS devices. Use Expo Go on an iPhone to sign in with Apple.");
      return;
    }

    setSocialLoading("Apple");
    try {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const nonce = Array.from(randomBytes).map(b => b.toString(16).padStart(2, "0")).join("");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      const identityToken = credential.identityToken;
      const appleName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ")
        : undefined;

      if (!identityToken) {
        Alert.alert(
          "Sign-In Failed",
          "Could not get identity token from Apple. Please try again."
        );
        return;
      }

      await socialLogin("apple", identityToken, appleName);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      const message = error instanceof Error ? error.message : "Apple sign-in failed";
      Alert.alert("Error", message);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      showSocialMessage("Google Sign-In requires configuration. Please use email/password sign-in for now.");
      return;
    }

    if (Platform.OS === "web") {
      showSocialMessage("Google Sign-In works best on mobile devices via Expo Go.");
      return;
    }

    setSocialLoading("Google");
    try {
      await promptGoogleAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      Alert.alert("Error", message);
      setSocialLoading(null);
    }
  };

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
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, isLogin, email, name, password, login, register, navigation]);

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
          {Platform.OS === "ios" ? (
            <Pressable
              onPress={handleAppleSignIn}
              style={[styles.socialButton, { backgroundColor: theme.text }]}
              disabled={socialLoading !== null}
            >
              {socialLoading === "Apple" ? (
                <ActivityIndicator size="small" color={theme.backgroundRoot} />
              ) : (
                <>
                  <Feather name="smartphone" size={20} color={theme.backgroundRoot} />
                  <ThemedText type="body" style={{ color: theme.backgroundRoot, marginLeft: Spacing.sm }}>
                    Continue with Apple
                  </ThemedText>
                </>
              )}
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleGoogleSignIn}
            style={[styles.socialButton, { backgroundColor: theme.backgroundDefault }]}
            disabled={socialLoading !== null}
          >
            {socialLoading === "Google" ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <>
                <Feather name="mail" size={20} color={theme.text} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  Continue with Google
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        {socialMessage ? (
          <View style={[styles.socialMessageContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="info" size={16} color={Colors.light.primary} />
            <ThemedText type="small" style={[styles.socialMessageText, { color: theme.text }]}>
              {socialMessage}
            </ThemedText>
          </View>
        ) : null}

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

          {isLogin ? (
            <Pressable
              onPress={() => navigation.replace("ForgotPassword")}
              style={styles.forgotPassword}
            >
              <ThemedText type="body" style={{ color: Colors.light.primary }}>
                Forgot Password?
              </ThemedText>
            </Pressable>
          ) : null}
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

        <ThemedText type="small" style={[styles.terms, { color: theme.textSecondary }]}>
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
  socialMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  socialMessageText: {
    flex: 1,
    lineHeight: 18,
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
  forgotPassword: {
    alignSelf: "center",
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
