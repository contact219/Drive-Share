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
import PaymentMethodsScreen from "@/screens/PaymentMethodsScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import DrivingLicenseScreen from "@/screens/DrivingLicenseScreen";
import HelpSupportScreen from "@/screens/HelpSupportScreen";
import AppearanceScreen from "@/screens/AppearanceScreen";
import LanguageScreen from "@/screens/LanguageScreen";
import LocationScreen from "@/screens/LocationScreen";
import RateAppScreen from "@/screens/RateAppScreen";
import ShareAppScreen from "@/screens/ShareAppScreen";
import DataDownloadScreen from "@/screens/DataDownloadScreen";
import VehicleMapScreen from "@/screens/VehicleMapScreen";
import OwnerDashboardScreen from "@/screens/OwnerDashboardScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  VehicleDetail: { vehicleId: string };
  Booking: { vehicleId: string };
  BookingConfirmation: { vehicleId: string; startDate: string; endDate: string };
  Filter: {
    onApply?: (filters: {
      types?: string[];
      fuelTypes?: string[];
      transmission?: string;
      minPrice?: number;
      maxPrice?: number;
      minSeats?: number;
      maxDistance?: number;
      features?: string[];
    }) => void;
  } | undefined;
  Auth: undefined;
  ForgotPassword: undefined;
  Settings: undefined;
  Terms: undefined;
  Privacy: undefined;
  ActiveTrip: { tripId: string };
  PaymentMethods: undefined;
  Notifications: undefined;
  DrivingLicense: undefined;
  HelpSupport: undefined;
  Appearance: undefined;
  Language: undefined;
  Location: undefined;
  RateApp: undefined;
  ShareApp: undefined;
  DataDownload: undefined;
  VehicleMap: undefined;
  OwnerDashboard: undefined;
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
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrivingLicense"
        component={DrivingLicenseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RateApp"
        component={RateAppScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShareApp"
        component={ShareAppScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DataDownload"
        component={DataDownloadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleMap"
        component={VehicleMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OwnerDashboard"
        component={OwnerDashboardScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
