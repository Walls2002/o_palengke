import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { deliveryApi } from "@/api/rider/deliveryApi";
import axios from "axios";
import { userApi } from "@/api/customer/customerApi";

const VerifyOTPScreen = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const {
    email,
    type,
    first_name,
    middle_name,
    last_name,
    contact,
    password,
    license_number,
    plate_number,
    location_id,
    store_id,
  } = useLocalSearchParams();
  const emailValue = typeof email === "string" ? email : "";
  const typeValue = typeof type === "string" ? type : "";
  const payload = {
    first_name: typeof first_name === "string" ? first_name : "",
    middle_name: typeof middle_name === "string" ? middle_name : "",
    last_name: typeof last_name === "string" ? last_name : "",
    email: typeof email === "string" ? email : "",
    contact: typeof contact === "string" ? contact : "",
    password: typeof password === "string" ? password : "",
    license_number:
      typeof license_number === "string" ? license_number : undefined,
    plate_number: typeof plate_number === "string" ? plate_number : undefined,
    location_id: typeof location_id === "string" ? location_id : "",
    store_id: typeof store_id === "string" ? store_id : undefined,
  };

  const riderRegistration = async () => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      const response = await deliveryApi.registerRider(formData);
      return response;
    } catch (error) {
      console.error("Error in rider registration:", error);
      return null;
    }
  };
  const customerRegistration = async () => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      const response = await userApi.registerCustomer(formData);
      return response;
    } catch (error) {
      console.error("Error in customer registration:", error);
      return null;
    }
  };

  const vendorRegistration = async () => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      const response = await userApi.registerVendor(formData);
      return response;
    } catch (error) {
      console.error("Error in vendor registration:", error);
      return null;
    }
  };

  const inputRefs = Array(otp.length)
    .fill(null)
    .map(() => React.createRef<TextInput>());

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Automatically focus the next input if the current one is filled
    if (text.length === 1 && index < otp.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    setLoading(true);
    if (otpCode.length !== 6) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid OTP",
        text2: "Please enter a valid OTP.",

        visibilityTime: 3000,
      });
      setOtpError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/verify-otp`,
        { email, otp: otpCode },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;
      if (data.code === 200) {
        Toast.show({
          type: "success",
          position: "top",
          text1: "OTP Verified",
          text2: "Your OTP has been successfully verified.",
          visibilityTime: 3000,
        });
        console.log("rider:" + typeValue);

        if (typeValue === "rider") {
          const registrationResponse = await riderRegistration();
          if (
            registrationResponse &&
            (registrationResponse.code === 200 ||
              registrationResponse.code === 201)
          ) {
            Toast.show({
              type: "success",
              position: "top",
              text1: "Registration Successful",
              text2: "Your registration has been successfully completed.",
              visibilityTime: 3000,
            });
            router.push("/login");
          } else {
            Toast.show({
              type: "error",
              position: "top",
              text1: "Registration Failed",
              text2: registrationResponse?.message || "Please try again.",
              visibilityTime: 3000,
            });
          }
        } else if (typeValue === "customer") {
          const registrationResponse = await customerRegistration();
          if (
            registrationResponse &&
            (registrationResponse.status === 200 ||
              registrationResponse.status === 201)
          ) {
            Toast.show({
              type: "success",
              position: "top",
              text1: "Registration Successful",
              text2: "Your registration has been successfully completed.",
              visibilityTime: 3000,
            });
            router.push("/login");
          } else {
            Toast.show({
              type: "error",
              position: "top",
              text1: "Registration Failed",
              text2: "Please try again.",
              visibilityTime: 3000,
            });
          }
        } else if (typeValue === "vendor") {
          const registrationResponse = await vendorRegistration();
          if (
            registrationResponse &&
            (registrationResponse.status === 200 ||
              registrationResponse.status === 201)
          ) {
            Toast.show({
              type: "success",
              position: "top",
              text1: "Registration Successful",
              text2: "Your registration has been successfully completed.",
              visibilityTime: 3000,
            });
            router.push("/login");
          } else {
            Toast.show({
              type: "error",
              position: "top",
              text1: "Registration Failed",
              text2: "Please try again.",
              visibilityTime: 3000,
            });
          }
        }

        // Navigate to the next screen or perform any action after successful verification
        router.push("/login");
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Verification Failed",
          text2: data.message || "Please try again.",
          visibilityTime: 3000,
        });
        setOtpError(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in OTP verification:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Verification Failed",
        text2: "An error occurred while verifying the OTP.",
        visibilityTime: 3000,
      });
      setLoading(false);
      return;
    }

    setOtpError(false);
    setLoading(false);
  };

  const resendOtp = async () => {
    setLoading(true);

    try {
      const otpResend = await axios.post(
        `${baseUrl}/send-otp`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = otpResend.data;
      if (data.code === 200) {
        Toast.show({
          type: "success",
          position: "top",
          text1: "OTP Resent",
          text2: "A new OTP has been sent to your email.",
          visibilityTime: 3000,
        });
        setOtp(["", "", "", "", "", ""]); // Clear the OTP inputs
        otp.forEach((_, index) => {
          inputRefs[index].current?.clear(); // Clear each input field
        });
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Resend Failed",
          text2: data.message || "Please try again.",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error in resending OTP:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Resend Failed",
        text2: "An error occurred while resending the OTP.",
        visibilityTime: 3000,
      });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-white px-4">
      <Image
        source={require("../../assets/images/hero.png")}
        className="h-[350px] w-[350px] mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-primary mb-6">Verify OTP</Text>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-row justify-center space-x-2 mb-6"
      >
        {otp.map((value, index) => (
          <View key={index} style={{ marginHorizontal: 6 }}>
            <TextInput
              ref={inputRefs[index]}
              className={`w-12 h-12 border rounded-lg text-center text-lg font-semibold ${
                otpError ? "border-red-500" : "border-gray-300"
              }`}
              maxLength={1}
              keyboardType="number-pad"
              value={value}
              onChangeText={(text) => handleChange(text, index)}
            />
          </View>
        ))}
      </KeyboardAvoidingView>
      <TouchableOpacity
        activeOpacity={1}
        onPress={verifyOTP}
        disabled={loading}
        className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Verify OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity disabled={loading} onPress={resendOtp} className="mt-4">
        <Text className="text-primary text-sm font-medium">Resend OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={loading}
        className="mt-4"
        onPress={() => router.push("/login")}
      >
        <Text className="text-primary text-sm font-medium">Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyOTPScreen;
