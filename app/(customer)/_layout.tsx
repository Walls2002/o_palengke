import { Tabs, Slot, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
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
import { useTabVisibility } from "@/provider/TabVisibilityProvider";

export default function TabLayout() {
  const { isTabVisible } = useTabVisibility();
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
            display: isTabVisible ? "flex" : "none",
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
        name="orders"
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
            <View style={{ marginTop: 5 }}>
              <FontAwesome
                size={26}
                stroke={color}
                name="shopping-bag"
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <ShoppingCart size={26} stroke={color} />
            </View>
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
      {/* Hide any other routes that might be auto-detected */}
      <Tabs.Screen
        name="_components/CheckoutBottomSheet"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
