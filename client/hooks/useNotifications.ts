import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { getApiUrl } from "@/lib/query-client";

let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

if (Platform.OS !== "web") {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
  Constants = require("expo-constants").default;
}

interface NotificationToken {
  token: string;
  platform: string;
}

export function useNotifications(userId?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      setPermission(false);
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    checkPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log("Notification received:", notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log("Notification response:", response);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === "web" || !Notifications) {
      setPermission(false);
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setPermission(status === "granted");
  };

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "web" || !Notifications || !Device) {
      return false;
    }

    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermission(finalStatus === "granted");
    return finalStatus === "granted";
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === "web" || !Notifications || !Device || !userId) {
      return null;
    }

    if (!Device.isDevice) {
      return null;
    }

    setIsRegistering(true);

    try {
      const granted = await requestPermissions();
      if (!granted) {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants?.expoConfig?.extra?.eas?.projectId,
      });
      
      const token = tokenData.data;
      setExpoPushToken(token);

      await fetch(new URL("/api/notifications/register", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          token,
          platform: Platform.OS,
        }),
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
        });
      }

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [userId, requestPermissions]);

  const deactivateToken = useCallback(async () => {
    if (!expoPushToken) return;

    try {
      await fetch(new URL("/api/notifications/deactivate", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: expoPushToken }),
      });
      setExpoPushToken(null);
    } catch (error) {
      console.error("Error deactivating push token:", error);
    }
  }, [expoPushToken]);

  return {
    expoPushToken,
    permission,
    isRegistering,
    requestPermissions,
    registerForPushNotifications,
    deactivateToken,
    isSupported: Platform.OS !== "web",
  };
}
