import React, { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/provider/AuthProvider";
import { userApi } from "@/api/user/userApi";

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const showToast = (user: any) => {
  Toast.show({
    type: "success",
    position: "top",
    text1: "Login success",
    text2: `Welcome back, ${user.first_name} 👋`,
    visibilityTime: 4500,
    text1Style: {
      fontSize: 20,
      fontWeight: "bold",
    },
    text2Style: {
      fontSize: 18,
      fontWeight: "semibold",
    },
  });
};

const Login = () => {
  const { success } = useLocalSearchParams();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loadUser } = useAuth();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); // New state for terms acceptance

  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: success.toString(),
        position: "top",
        visibilityTime: 3000,
      });
    }
  }, [success]);

  const handleLogin = async () => {
    if (!termsAccepted) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Terms not accepted",
        text2: "Please accept the terms and conditions to proceed.",
        visibilityTime: 3000,
        topOffset: 50,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password,
      });
      const { access_token, user, user_type } = response.data;
      const expo_push_token = await AsyncStorage.getItem("expo_push_token");

      await AsyncStorage.setItem("auth_token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("user_type", user_type);

      await userApi.checkUserProfile();
      await loadUser();
      if (expo_push_token && expo_push_token !== "") {
        try {
          const storeExpoToken = await axios.post(
            `${baseUrl}/users/store-push-token`,
            {
              user_id: user.id,
              expo_push_token: expo_push_token,
            },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );

          if (storeExpoToken.data.code === 200) {
            console.log(storeExpoToken.data.message);
          } else {
            console.error("Error saving push notification token");
          }
        } catch (error) {
          console.error("Failed to store Expo push token:", error);
        }
      }

      handleNavigation(user_type, user);
    } catch (error) {
      const errorMessage =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An unexpected error occurred.";
      Toast.show({
        type: "error",
        position: "top",
        text1: "Login failed",
        text2: errorMessage,
        visibilityTime: 3000,
        topOffset: 50,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 15,
          fontWeight: "semibold",
          flexWrap: "wrap",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (user_type: string, user: any) => {
    let route = "/(customer)";
    if (user_type === "vendor") {
      route = "/(vendor)" as any;
    } else if (user_type === "rider") {
      route = "/(rider)" as any;
    }

    router.replace(route as any);
    setTimeout(() => {
      showToast(user);
    }, 1000);
  };

  const handleUserSignUp = (type: "customer" | "vendor") => {
    if (type === "customer") {
      router.push({
        pathname: "/(auth)/register",
        params: { type: type },
      });
    } else if (type === "vendor") {
      router.push({
        pathname: "/(auth)/register",
        params: { type: type },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-white px-4">
      <Image
        source={require("../../assets/images/hero.png")}
        className="h-[350px] w-[350px] mb-6"
        resizeMode="contain"
      />
      <TextInput
        className="w-[300px] h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View className="w-[300px] h-12 border border-gray-300 rounded-lg flex-row items-center px-4 mb-6">
        <TextInput
          className="flex-1"
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? (
            <EyeOff size={20} color="gray" />
          ) : (
            <Eye size={20} color="gray" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setTermsAccepted(!termsAccepted)}
          className="mr-2"
        >
          <View
            className={`w-5 h-5 border ${
              termsAccepted ? "bg-primary" : "border-gray-300"
            } rounded`}
          />
        </TouchableOpacity>
        <Text className="text-textPrimary">
          I agree to the{" "}
          <TouchableOpacity
            onPress={() => router.push("../terms-and-condition")}
          >
            <Text className="text-primary font-semibold">
              Terms and Conditions
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleLogin}
        disabled={loading || !termsAccepted || email == "" || password == ""} // Disable if terms not accepted
        className={`w-[300px] h-12 ${
          loading || !termsAccepted || email == "" || password == ""
            ? "bg-gray-300"
            : "bg-primary"
        } rounded-lg justify-center items-center`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/forgot-password")}
        className="mt-4"
      >
        <Text className="text-primary text-sm font-medium">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <View className="mt-4 flex-row flex-wrap justify-center">
        <Text className="text-textPrimary">
          Don't have an account? Sign up as{" "}
        </Text>
        <TouchableOpacity onPress={() => handleUserSignUp("customer")}>
          <Text className="text-primary font-semibold">Customer, </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleUserSignUp("vendor")}>
          <Text className="text-primary font-semibold">Vendor</Text>
        </TouchableOpacity>
        <Text className="text-textPrimary mx-1">or</Text>
        <TouchableOpacity onPress={() => router.push("/rider-registration")}>
          <Text className="text-primary font-semibold">Rider</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
