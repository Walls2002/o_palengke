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
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { Location } from "@/types/Location";
import { data } from "@/api/vendor/vendorApi";
import { useRoute, RouteProp } from "@react-navigation/native";
import { userApi } from "@/api/customer/customerApi";
import { deliveryApi } from "@/api/rider/deliveryApi";
import { Store } from "@/types/Store";

interface FormData {
  [key: string]: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  location_id: null;
  password: string;
  confirm_password: string;
  store_id: null;
  license_number: string;
  plate_number: string;
}

const Register = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    location_id: null,
    password: "",
    confirm_password: "",
    store_id: null,
    license_number: "",
    plate_number: "",
  });

  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const [storesList, setStoresList] = useState<Store[]>([]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchAllStores();
  }, []);

  const fetchLocations = async () => {
    const response = await data.vendorLocations();
    setLocationsList(response);
  };

  const checkUniqueness = async (
    license_number: string,
    plate_number: string
  ) => {
    try {
      const response = await deliveryApi.checkUniquenessPlateAndLicense(
        plate_number,
        license_number
      );
      return response;
    } catch (error) {
      console.error("Error checking uniqueness:", error);
      showToast("Error checking uniqueness. Please try again.");
      return null;
    }
  };

  const checkEmailUniqueness = async (email: string) => {
    try {
      const response = await userApi.checkEmailExists(email);
      return response;
    } catch (error) {
      console.error("Error checking email uniqueness:", error);
      showToast("Error checking email uniqueness. Please try again.");
      return null;
    }
  };

  const fetchAllStores = async () => {
    try {
      const response = await data.vendorAllStores();
      setStoresList(response);
    } catch (error) {
      console.error("Error fetching stores:", error);
      showToast("Failed to fetch stores. Please try again.");
    }
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
    setLoading(true);
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "contact_number",
      "location_id",
      "password",
      "confirm_password",

      "store_id",
      "license_number",
      "plate_number",
    ];
    const hasEmpty = requiredFields.some((key) => {
      const value = form[key as keyof typeof form];
      return value === null || value?.toString().trim() === "";
    });

    if (hasEmpty) {
      showToast("Please fill in required fields.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirm_password) {
      showToast("Passwords do not match");
      setLoading(false);
      return;
    }

    const uniquenessCheck = await checkUniqueness(
      form.license_number,
      form.plate_number
    );

    if (
      (uniquenessCheck !== null && uniquenessCheck.plate_number_exists) ||
      uniquenessCheck.license_number_exists
    ) {
      showToast("Plate number or license number already exists.");
      setLoading(false);
      return;
    }
    const emailCheck = await checkEmailUniqueness(form.email);
    if (emailCheck && emailCheck.exists) {
      showToast("Email has already been taken. Please try again.");
      setLoading(false);
      return;
    }
    // Password validation: at least 1 capital letter, 1 number, and minimum 8 characters
    const password = form.password;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      showToast(
        "Password must be at least 8 characters, include 1 capital letter and 1 number."
      );
      setLoading(false);
      return;
    }
    const plus63MobileRegex = /^\+63\d{10}$/;
    if (!plus63MobileRegex.test(form.contact_number.trim())) {
      showToast(
        "Please enter a valid Philippine mobile number (e.g., +639XXXXXXXXX)."
      );
      setLoading(false);
      return;
    }

    router.push(
      `/verify-otp-registration?email=${encodeURIComponent(
        form.email.trim()
      )}&type=${encodeURIComponent("rider")}&first_name=${encodeURIComponent(
        form.first_name.trim()
      )}&middle_name=${encodeURIComponent(
        form.middle_name.trim()
      )}&last_name=${encodeURIComponent(
        form.last_name.trim()
      )}&contact=${encodeURIComponent(
        form.contact_number.trim()
      )}&password=${encodeURIComponent(form.password.trim())}&license_number=${
        form.license_number
          ? encodeURIComponent(form.license_number.trim())
          : ""
      }&plate_number=${
        form.plate_number ? encodeURIComponent(form.plate_number.trim()) : ""
      }&location_id=${encodeURIComponent(form.location_id ?? "")}&store_id=${
        form.store_id ? encodeURIComponent(form.store_id) : ""
      }`
    );

    // try {
    //   let response = null;
    // } catch (error) {
    //   showToast("Email has already been taken. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
    setLoading(false);
  };

  return (
    <ScrollView>
      <SafeAreaView className="flex-1 items-center bg-white px-4">
        <Image
          source={require("../../assets/images/hero.png")}
          className="h-[300px] w-[300px]"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-primary mb-6">
          Rider Registration
        </Text>

        {[
          { placeholder: "First Name *", key: "first_name" },
          { placeholder: "Middle Name", key: "middle_name" },
          { placeholder: "Last Name *", key: "last_name" },
          {
            placeholder: "Email *",
            key: "email",
            keyboardType: "email-address",
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

        {/* Contact Number with +63 prefix */}
        <View className="w-[300px] h-12 border border-gray-300 rounded-lg flex-row items-center px-4 mb-4">
          <Text className="text-gray-500 mr-2">+63</Text>
          <TextInput
            className="flex-1"
            placeholder="Contact Number *"
            keyboardType="phone-pad"
            value={
              form.contact_number && form.contact_number.startsWith("+63")
                ? form.contact_number.slice(3)
                : form.contact_number ?? ""
            }
            onChangeText={(val) =>
              handleChange("contact_number", "+63" + val.replace(/^0+/, ""))
            }
            maxLength={10}
          />
        </View>

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
        <View className="w-[300px] mb-4">
          <Text className="mb-1 text-gray-700">
            Store <Text className="text-red-500">*</Text>
          </Text>
          <View className="border border-gray-300 rounded-lg overflow-hidden h-12 justify-center">
            <Picker
              selectedValue={form.store_id}
              onValueChange={(value) => handleChange("store_id", value)}
            >
              <Picker.Item label="Select Store" value="" />
              {storesList.map((store) => (
                <Picker.Item
                  key={store.id}
                  label={`${store.store_name}`}
                  value={store.id}
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
