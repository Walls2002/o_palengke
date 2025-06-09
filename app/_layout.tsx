import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/provider/AuthProvider";
import { OrderProvider, useOrderContext } from "@/provider/OrderProvider";

import { CartProvider } from "@/provider/CartProvider";
import { DeliveryOrderProvider } from "@/provider/DeliveryOrderProvider";
import { Suspense, useEffect, useRef } from "react";
import { TabVisibilityProvider } from "@/provider/TabVisibilityProvider";
import LoadingScreen from "@/components/LoadingScreen";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import NotificationWatcher from "@/components/NotificationWatcher";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH, // Set high priority for Android
    vibrate: true, // Enable vibration for Android
  }),
});

export default function RootLayout() {
  // 🛠️ Notification Setup
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permissions not granted");
      }

      try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        console.log("Expo Push Token:", tokenResponse.data); // 👈 Should log here
        await AsyncStorage.setItem("expo_push_token", tokenResponse.data);
      } catch (e) {
        console.error("Failed to get push token:", e);
        await AsyncStorage.setItem("expo_push_token", ""); // Store empty string if failed
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification Received:", notification);
      }
    );

    const sub2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 User tapped notification:", response);
      }
    );

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <TabVisibilityProvider>
      <AuthProvider>
        <CartProvider>
          <DeliveryOrderProvider>
            <OrderProvider>
              <NotificationWatcher />
              {/* 👈 Custom hook inside OrderProvider scope */}
              <Suspense fallback={<LoadingScreen message="Loading..." />}>
                <RootLayoutNav />
              </Suspense>
            </OrderProvider>
          </DeliveryOrderProvider>
        </CartProvider>
        <Toast />
      </AuthProvider>
    </TabVisibilityProvider>
  );
}

function RootLayoutNav() {
  const { user, userType, isLoading } = useAuth() as {
    user: { type: string } | null;
    userType: string;
    isLoading: boolean;
  };

  if (isLoading) {
    return <LoadingScreen message="Starting up..." />;
  }

  let initialRouteName = "(public)";
  if (user) {
    if (userType === "customer") {
      initialRouteName = "(customer)";
    } else if (userType === "vendor") {
      initialRouteName = "(vendor)";
    } else if (userType === "rider") {
      initialRouteName = "(rider)";
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={initialRouteName} options={{ headerShown: false }} />
    </Stack>
  );
}
