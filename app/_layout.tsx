import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/provider/AuthProvider";
import { OrderProvider } from "@/provider/OrderProvider";
import { CartProvider } from "@/provider/CartProvider";
import { DeliveryOrderProvider } from "@/provider/DeliveryOrderProvider";
import { Suspense } from "react";
import { TabVisibilityProvider } from "@/provider/TabVisibilityProvider";
import LoadingScreen from "@/components/LoadingScreen";
import Toast from "react-native-toast-message";
export default function RootLayout() {
  return (
    <TabVisibilityProvider>
      <AuthProvider>
        <CartProvider>
          <DeliveryOrderProvider>
            <OrderProvider>
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
