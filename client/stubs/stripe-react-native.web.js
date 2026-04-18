// Web stub for @stripe/stripe-react-native
// Stripe native SDK is not supported on web. Payments work via Expo Go on device.

import React from "react";

export const StripeProvider = ({ children }) => children;

export const useStripe = () => ({
  initPaymentSheet: async () => ({ error: { message: "Payments not supported on web" } }),
  presentPaymentSheet: async () => ({ error: { message: "Payments not supported on web" } }),
  confirmPayment: async () => ({ error: { message: "Payments not supported on web" } }),
  createPaymentMethod: async () => ({ error: { message: "Payments not supported on web" } }),
  handleNextAction: async () => ({ error: { message: "Payments not supported on web" } }),
  retrievePaymentIntent: async () => ({ error: { message: "Payments not supported on web" } }),
});

export const usePaymentSheet = () => ({
  initPaymentSheet: async () => ({ error: { message: "Payments not supported on web" } }),
  presentPaymentSheet: async () => ({ error: { message: "Payments not supported on web" } }),
  loading: false,
});

export const CardField = () => null;
export const CardForm = () => null;
export const PaymentSheet = () => null;

export default { StripeProvider, useStripe, usePaymentSheet, CardField, CardForm };
