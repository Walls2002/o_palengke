import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleForgotPassword = async () => {
    setLoading(true);

    if (!email) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Email is required",
        visibilityTime: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/customer/verify-email`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = await response.data;

      if (data?.exists) {
        try {
          const otpResponse = await axios.post(
            `${baseUrl}/send-otp`,
            { email },
            { headers: { "Content-Type": "application/json" } }
          );

          if (otpResponse.data.code === 200) {
            Toast.show({
              type: "success",
              position: "top",
              text1: "OTP sent successfully",
              text2: "Please check your email for the OTP.",
              visibilityTime: 3000,
            });
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          }
        } catch (error) {
          console.error("Error sending OTP:", error);
          Toast.show({
            type: "error",
            position: "top",
            text1: "Failed to send OTP",
            text2: "Please try again later.",
            visibilityTime: 3000,
          });
          setLoading(false);
          return;
        }
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Email not found",
          text2: "Please check the email address and try again.",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error in handleForgotPassword:", error);

      Toast.show({
        type: "error",
        position: "top",
        text1: "Error checking email",
        text2: "Please try again later.",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-white px-4">
      <Image
        source={require("../../assets/images/hero.png")} // Replace with your logo path
        className="h-[350px] w-[350px] mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-primary mb-6">
        Forgot Password
      </Text>
      <TextInput
        className="w-[300px] h-12 border border-gray-300 rounded-lg px-4 mb-6"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleForgotPassword}
        disabled={loading}
        className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Send OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/login")} className="mt-4">
        <Text className="text-primary text-sm font-medium">Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ForgotPassword;
