import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import VehicleDetailScreen from "@/screens/VehicleDetailScreen";
import BookingScreen from "@/screens/BookingScreen";
import BookingConfirmationScreen from "@/screens/BookingConfirmationScreen";
import FilterScreen from "@/screens/FilterScreen";
import AuthScreen from "@/screens/AuthScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ActiveTripScreen from "@/screens/ActiveTripScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import TermsScreen from "@/screens/TermsScreen";
import PrivacyScreen from "@/screens/PrivacyScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  VehicleDetail: { vehicleId: string };
  Booking: { vehicleId: string };
  BookingConfirmation: { vehicleId: string; startDate: string; endDate: string };
  Filter: undefined;
  Auth: undefined;
  ForgotPassword: undefined;
  Settings: undefined;
  Terms: undefined;
  Privacy: undefined;
  ActiveTrip: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Book Vehicle",
        }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Confirm Booking",
        }}
      />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{
          presentation: "modal",
          headerTitle: "Filters",
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ActiveTrip"
        component={ActiveTripScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
}
