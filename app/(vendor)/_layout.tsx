import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View, TouchableOpacity } from "react-native";
import "../../global.css";
import {
  TicketPercent,
  ListOrdered,
  House,
  ShoppingCart,
  UserRound,
  Store,
} from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="shopping-bag" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={{ marginTop: 10 }}>
              <Store size={26} stroke={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

