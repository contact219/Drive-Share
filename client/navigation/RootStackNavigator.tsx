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
import ConversationsScreen from "@/screens/ConversationsScreen";
import ChatScreen from "@/screens/ChatScreen";
import AddVehicleScreen from "@/screens/AddVehicleScreen";
import EditVehicleScreen from "@/screens/EditVehicleScreen";
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
  Conversations: undefined;
  Chat: { conversationId: string };
  AddVehicle: undefined;
  EditVehicle: {
    ownerVehicleId: string;
    ownerId: string;
    vehicle: {
      id: string;
      name: string;
      brand: string;
      model: string;
      year: number;
      type: string;
      pricePerHour: string;
      imageUrl: string;
      seats: number;
      fuelType: string;
      transmission: string;
      locationAddress?: string;
      features?: string[];
    };
  };
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
        options={{ ...opaqueScreenOptions, headerTitle: "Payment Methods" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Notifications" }}
      />
      <Stack.Screen
        name="DrivingLicense"
        component={DrivingLicenseScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Driving License" }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Help & Support" }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Appearance" }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Language" }}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Location" }}
      />
      <Stack.Screen
        name="RateApp"
        component={RateAppScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Rate App" }}
      />
      <Stack.Screen
        name="ShareApp"
        component={ShareAppScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Share App" }}
      />
      <Stack.Screen
        name="DataDownload"
        component={DataDownloadScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Download My Data" }}
      />
      <Stack.Screen
        name="VehicleMap"
        component={VehicleMapScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Map View" }}
      />
      <Stack.Screen
        name="OwnerDashboard"
        component={OwnerDashboardScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Host Dashboard" }}
      />
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Messages" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Chat",
        }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Add Vehicle" }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{ ...opaqueScreenOptions, headerTitle: "Edit Vehicle" }}
      />
    </Stack.Navigator>
  );
}
