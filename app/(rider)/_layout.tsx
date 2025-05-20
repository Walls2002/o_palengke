import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { View, TouchableOpacity } from "react-native";
import "../../global.css";
import { House, UserRound, Users } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
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
        name="index"
        options={{
          title: "Delivery",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <MaterialCommunityIcons
                name="bike-fast"
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="local-order"
        options={{
          title: "Local Order",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <House size={26} stroke={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="team-order"
        options={{
          title: "Team Order",
          tabBarIcon: ({ color }: { color: string }) => (
            <View style={{ marginTop: 10 }}>
              <Users size={26} stroke={color} />
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
    </Tabs>
  );
}
