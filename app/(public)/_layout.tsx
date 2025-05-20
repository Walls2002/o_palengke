import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/provider/AuthProvider";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { View, TouchableOpacity } from "react-native";
import "../../global.css";
import {
  TicketPercent,
  ListOrdered,
  House,
  ShoppingCart,
  UserRound,
} from "lucide-react-native";


export default function PublicLayout() {
  const { user, userType } = useAuth() as {
    user: { type: string } | null;
    userType: string;
  };

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarActiveTintColor: "#337037",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarButton: (
          props: React.ComponentProps<typeof TouchableOpacity>
        ) => <TouchableOpacity {...props} activeOpacity={1} />,
        tabBarPressColor: "transparent",
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 5,
            height: 70,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            borderBottomRightRadius: 15,
            borderBottomLeftRadius: 15,
            paddingVertical: 5,
          },
        }),
        tabBarLabelStyle: {
          marginTop: 2,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="voucher"
        options={{
          title: "Voucher",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <TicketPercent size={26} stroke={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <ListOrdered size={26} stroke={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="shopping-bag" size={24} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                if (user) {
                  if (userType === "customer") {
                    router.push("/(customer)");
                  } else if (userType === "vendor") {
                    router.push("/(vendor)");
                  } else if (userType === "rider") {
                    router.push("/(rider)");
                  } else {
                    console.error("Unknown userType:", userType);
                  }
                } else {
                  router.push("/login");
                }
              }}
            >
              <FontAwesome name="user-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <UserRound size={26} stroke={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
