import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from "@stripe/stripe-react-native";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { getApiUrl } from "@/lib/query-client";

export default function App() {
  const [publishableKey, setPublishableKey] = useState<string>("");

  useEffect(() => {
    async function fetchStripeKey() {
      try {
        const url = new URL("/api/stripe/publishable-key", getApiUrl());
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setPublishableKey(data.publishableKey ?? "");
        }
      } catch {
        // Stripe unavailable — payments will fail gracefully at checkout
      }
    }
    fetchStripeKey();
  }, []);

  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.rush.carshare"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SettingsProvider>
              <FavoritesProvider>
                <SafeAreaProvider>
                  <GestureHandlerRootView style={styles.root}>
                    <KeyboardProvider>
                      <NavigationContainer>
                        <RootStackNavigator />
                      </NavigationContainer>
                      <StatusBar style="auto" />
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </SafeAreaProvider>
              </FavoritesProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
