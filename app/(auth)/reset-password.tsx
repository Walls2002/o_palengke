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
import { Eye, EyeOff } from "lucide-react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

const ResetPassword = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { email } = useLocalSearchParams();
  const emailValue = typeof email === "string" ? email : "";
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleResetPassword = async () => {
    console.log("Resetting password for email:", emailValue);
    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Fields cannot be empty",
        text2: "Please fill in both password fields.",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: "error",
        text1: "Invalid Password",
        text2:
          "Password must be at least 8 characters, include 1 capital letter and 1 number.",
        position: "top",
        visibilityTime: 3000,
      });

      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password mismatch",
        text2: "Passwords do not match. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/reset-password`, {
        newPassword: password,
        email: emailValue,
      });

      const data = await response.data;

      if (data?.code === 200) {
        Toast.show({
          type: "success",
          text1: "Password reset successful",
          text2: "You can now log in with your new password.",
          position: "top",
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Reset failed",
          text2: data?.message || "An unexpected error occurred.",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      router.replace("/login");
    } catch (error) {
      const errorMessage =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An unexpected error occurred.";
      Toast.show({
        type: "error",
        text1: "Reset failed",
        text2: errorMessage,
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-white px-4">
      <Image
        source={require("../../assets/images/hero.png")}
        className="h-[350px] w-[350px] mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-primary mb-6">
        Reset Password
      </Text>
      <View className="w-[300px] h-12 border border-gray-300 rounded-lg flex-row items-center px-4 mb-4">
        <TextInput
          style={{ flex: 1 }}
          placeholder="New Password"
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
      <View className="w-[300px] h-12 border border-gray-300 rounded-lg flex-row items-center px-4 mb-6">
        <TextInput
          style={{ flex: 1 }}
          placeholder="Confirm Password"
          secureTextEntry={!confirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
        >
          {confirmPasswordVisible ? (
            <EyeOff size={20} color="gray" />
          ) : (
            <Eye size={20} color="gray" />
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleResetPassword}
        disabled={loading}
        className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-lg font-semibold">
            Reset Password
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ResetPassword;
