import React, { useState } from "react";
import { View, TextInput, Image, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import API from "@/api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userApi } from "@/api/user/userApi";

const LoginScreen = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password,
      });

      const { access_token, user, user_type } = response.data;
      await AsyncStorage.setItem("auth_token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("user_type", user_type);

      await userApi.checkUserProfile();
    } catch (error) {
      setError("Invalid credentials");
      console.log(error); // Optionally log the error for debugging
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
      {error && <Text className="text-red-500 mb-4">{error}</Text>}
      <TouchableOpacity
        onPress={handleLogin}
        className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
      >
        <Text className="text-white text-lg font-semibold">Login</Text>
      </TouchableOpacity>
      <Text className="text-textPrimary mt-4">Don't have an account? Sign up as <TouchableOpacity>Customer</TouchableOpacity>or <TouchableOpacity>Vendor</TouchableOpacity></Text>
    </SafeAreaView>
  );
};

export default LoginScreen;