import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  ToastAndroid,
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { Location } from "@/types/Location";
import { data } from "@/api/vendor/vendorApi";
import { useRoute, RouteProp } from "@react-navigation/native";
import { userApi } from "@/api/customer/customerApi";

type RegisterRouteParams = {
  params: {
    type: "customer" | "vendor";
  };
};

interface FormData {
  [key: string]: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  contact: string;
  location_id: null;
  password: string;
  confirm_password: string;
}

const Register = () => {
  const router = useRouter();
  const route = useRoute<RouteProp<RegisterRouteParams, "params">>();
  const { type } = route.params || {};
  const [form, setForm] = useState<FormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact: "",
    location_id: null,
    password: "",
    confirm_password: "",
  });

  const [locationsList, setLocationsList] = useState<Location[]>([]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const response = await data.vendorLocations();
    setLocationsList(response);
  };

  const handleChange = (key: string, value: string | null) => {
    setForm({ ...form, [key]: value });
  };

  const showToast = (message: string, type: "success" | "error" = "error") => {
    Toast.show({
      type,
      text1: message,
      position: "top",
      visibilityTime: 3000,
    });
  };

  const handleSignup = async () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "contact",
      "location_id",
      "password",
      "confirm_password",
      "middle_name",
    ];
    const hasEmpty = requiredFields.some((key) => {
      const value = form[key as keyof typeof form];
      return value === null || value?.toString().trim() === "";
    });

    if (hasEmpty) {
      showToast("Please fill in required fields.");
      return;
    }

    if (form.password !== form.confirm_password) {
      showToast("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      let response = null;
      if (type === "customer") {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value || "");
        });
        response = await userApi.registerCustomer(formData);
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value || "");
        });
        response = await userApi.registerVendor(formData);
      }
      if (response.status === 201) {
        router.replace({
          pathname: "/(auth)/login",
          params: { success: "Account created successfully. Please log in." },
        });
      } else {
        showToast("Email has already been taken. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      showToast("Email has already been taken. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView className="flex-1 items-center bg-white px-4">
        <Image
          source={require("../../assets/images/hero.png")}
          className="h-[300px] w-[300px]"
          resizeMode="contain"
        />

        {[
          { placeholder: "First Name *", key: "first_name" },
          { placeholder: "Middle Name *", key: "middle_name" },
          { placeholder: "Last Name *", key: "last_name" },
          {
            placeholder: "Email *",
            key: "email",
            keyboardType: "email-address",
          },
          {
            placeholder: "Contact Number *",
            key: "contact",
            keyboardType: "phone-pad",
          },
        ].map(({ placeholder, key, keyboardType }) => (
          <TextInput
            key={key}
            className="w-[300px] h-12 border border-gray-300 rounded-lg px-4 mb-4"
            placeholder={placeholder}
            keyboardType={(keyboardType || "default") as KeyboardTypeOptions}
            value={form[key] ?? ""}
            onChangeText={(val) => handleChange(key, val)}
          />
        ))}

        {/* Location Picker */}
        <View className="w-[300px] mb-4">
          <Text className="mb-1 text-gray-700">
            Location <Text className="text-red-500">*</Text>
          </Text>
          <View className="border border-gray-300 rounded-lg overflow-hidden h-12 justify-center">
            <Picker
              selectedValue={form.location_id}
              onValueChange={(value) => handleChange("location_id", value)}
            >
              <Picker.Item label="Select location" value="" />
              {locationsList.map((location) => (
                <Picker.Item
                  key={location.id}
                  label={`${location.barangay}, ${location.province}, ${location.city}`}
                  value={location.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View className="w-[300px] h-12 border border-gray-300 rounded-lg flex-row items-center px-4 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Password *"
            secureTextEntry={!passwordVisible}
            value={form.password}
            onChangeText={(val) => handleChange("password", val)}
          />
          <TouchableOpacity
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
            className="flex-1"
            placeholder="Confirm Password *"
            secureTextEntry={!passwordVisible}
            value={form.confirm_password}
            onChangeText={(val) => handleChange("confirm_password", val)}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeOff size={20} color="gray" />
            ) : (
              <Eye size={20} color="gray" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSignup}
          disabled={loading}
          className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View className="mt-4 flex-row flex-wrap justify-center">
          <Text className="text-textPrimary">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-primary font-semibold ml-1">Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Register;
