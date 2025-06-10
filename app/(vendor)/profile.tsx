import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  User,
  PencilLine,
  Check,
  Phone,
  MapPin,
  Mail,
  LockKeyhole,
  LogOut,
  EyeOff,
  Eye,
  Camera,
  X,
  ChevronDown,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Profile, UserCredentials } from "@/types/Profile";
import { useAuth } from "@/provider/AuthProvider";
import { userApi } from "@/api/user/userApi";
import capitalizeWords from "@/utils/formatString";
import axios from "axios";
const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [location, setLocation] = useState<
    { id: number; barangay: string; city: string; province: string }[]
  >([]);
  const router = useRouter();
  const { setUser, setUserType, user, logout, userType } = useAuth() as {
    setUser: (user: Profile | null) => void;
    setUserType: (type: string | null) => void;
    userType: string | null;
    user: Profile | null;
    logout: () => void;
  };
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isBasicInfoEditable, setIsBasicInfoEditable] =
    useState<boolean>(false);
  const [isCredentialsEditable, setIsCredentialsEditable] =
    useState<boolean>(false);
  const [isCameraEditable, setIsCameraEditable] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [userProfileForm, setUserProfileForm] = useState<Profile>({
    id: 0,
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    contact: "",
    location_id: 0,
    profile_picture: "",
    formatted_location: "",
  });
  const [userCredentials, setUserCredentials] = useState<UserCredentials>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  //Hooks
  useEffect(() => {
    if (user) {
      setUserProfileForm({
        id: user.id || 0,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        middle_name: user.middle_name || "",
        email: user.email || "",
        contact: user.contact || "",
        location_id: user.location_id || 0,
        profile_picture: user.profile_picture || "",
        formatted_location: "",
      });
    }

    // Find the exact location using location_id from the location array
    if (user && user.location_id && location.length > 0) {
      const userLocation =
        user && location.find((loc) => loc.id === Number(user.location_id));
      if (userLocation) {
        setUserProfileForm((prev) => ({
          ...prev,
          formatted_location: `${userLocation.barangay}, ${userLocation.city}, ${userLocation.province}`,
        }));
      }
    }
  }, [user, location]);

  useEffect(() => {
    if (user && user.profile_picture) {
      if (user.profile_picture.startsWith("http")) {
        setProfileImage(user.profile_picture);
      } else {
        setProfileImage(
          `${process.env.EXPO_PUBLIC_IMAGE_URL || ""}/storage/${
            user.profile_picture
          }`
        );
      }
    }
  }, [user]);

  useEffect(() => {
    userApi
      .getLocation()
      .then((response) => {
        setLocation(response.data);

        // If user has a location_id, find and set the exact location
        if (user && user.location_id) {
          const userLocation = response.data.find(
            (loc: { id: number }) => loc.id === Number(user.location_id)
          );
          if (userLocation) {
            setUserProfileForm((prev) => ({
              ...prev,
              formatted_location: `${userLocation.barangay}, ${userLocation.city}, ${userLocation.province}`,
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
      });
  }, [user]);

  //Event handler
  // Function to toggle visibility for a specific password field
  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleLogout = async () => {
    const access_token = await AsyncStorage.getItem("auth_token");
    const userString = await AsyncStorage.getItem("user");
    const userData = userString ? JSON.parse(userString) : null;
    const userId = userData ? userData.id : null;

    try {
      try {
        const storeExpoToken = await axios.post(
          `${baseUrl}/users/store-push-token`,
          {
            user_id: userId,
            expo_push_token: null, // Clear the Expo push token on logout
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        if (storeExpoToken.data.code === 200) {
          console.log("Push notification token cleared successfully");
        } else {
          console.error("Error saving push notification token");
        }
      } catch (error) {
        console.error("Failed to store Expo push token:", error);
      }
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("user_type");

      setUser(null);
      setUserType(null);
      // Call the logout function from the AuthProvider
      logout();
      Toast.show({
        type: "success",
        position: "top",
        text1: "Logout successfully",
        visibilityTime: 1500,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
      setTimeout(() => {
        router.replace("/(public)");
      }, 1500);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Handle select image and upload
  const handleSelectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Sorry, we need media library permissions to make this work!",
          visibilityTime: 1500,
          text1Style: { fontSize: 18, fontWeight: "bold" },
        });
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;

        // Show loading indicator
        setIsUploading(true);
        Toast.show({
          type: "info",
          position: "top",
          text1: "Uploading your profile picture...",
          visibilityTime: 2000,
          text1Style: { fontSize: 18, fontWeight: "bold" },
        });

        try {
          // Upload the image
          const response = await userApi.updateProfilePicture(selectedImageUri);
          if (response && response.profile_picture) {
            const imageUrl = `${
              process.env.EXPO_PUBLIC_API_URL || ""
            }/storage/${response.profile_picture}`;
            setProfileImage(imageUrl);

            if (user) {
              const updatedUser = {
                ...user,
                profile_picture: response.profile_picture,
              };
              setUser(updatedUser);
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } else {
            setProfileImage(selectedImageUri);
          }

          Toast.show({
            type: "success",
            position: "top",
            text1: response?.message || "Profile picture updated successfully",
            visibilityTime: 1500,
            text1Style: { fontSize: 18, fontWeight: "bold" },
          });
        } catch (error) {
          console.error("Error uploading profile picture:", error);

          Toast.show({
            type: "error",
            position: "top",
            text1: "Failed to update profile picture",
            text2: (error as any)?.response?.data?.message || "Network error",
            visibilityTime: 1500,
            text1Style: { fontSize: 18, fontWeight: "bold" },
          });
        }

        // Exit edit mode
        setIsCameraEditable(false);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Something went wrong while selecting an image",
        visibilityTime: 1500,
        text1Style: { fontSize: 18, fontWeight: "bold" },
      });
    } finally {
      setIsUploading(false);
      setIsCameraEditable(false);
    }
  };

  // Function to handle updating basic information
  const handleUpdateBasicInformation = async () => {
    try {
      const payload = {
        first_name: userProfileForm.first_name,
        last_name: userProfileForm.last_name,
        middle_name: userProfileForm.middle_name,
        email: userProfileForm.email,
        contact: userProfileForm.contact,
        location_id: userProfileForm.location_id,
      };

      const response = await userApi.updateBasicInformation(payload);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Profile updated successfully",
        visibilityTime: 1500,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
      setIsBasicInfoEditable(false);
      const updatedUser = user ? { ...user, ...payload } : null;

      if (updatedUser) {
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed to update profile",
        visibilityTime: 1500,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
    }
  };

  // Function to handle updating basic information
  const handleUpdateCredentials = async () => {
    try {
      // Check if new password matches confirm password
      if (userCredentials.new_password !== userCredentials.confirm_password) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Passwords do not match",
          visibilityTime: 1500,
          text1Style: {
            fontSize: 18,
            fontWeight: "bold",
          },
        });
        return;
      }

      const payload = {
        old_password: userCredentials.old_password,
        new_password: userCredentials.new_password,
        new_password_confirmation: userCredentials.confirm_password,
      };

      const response = await userApi.updateCredentials(payload);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Credentials updated successfully",
        visibilityTime: 1500,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
      setIsCredentialsEditable(false);
    } catch (error) {
      console.error("Error updating credentials:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed to update credentials",
        visibilityTime: 1500,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
    }
  };

  // Function to cancel basic information editing
  const handleCancelBasicInfoEdit = () => {
    if (user) {
      const userLocation = location.find(
        (loc) => loc.id === Number(user.location_id)
      );
      setUserProfileForm({
        id: user.id || 0,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        middle_name: user.middle_name || "",
        email: user.email || "",
        contact: user.contact || "",
        location_id: user.location_id || 0,
        profile_picture: user.profile_picture || "",
        formatted_location: userLocation
          ? `${userLocation.barangay}, ${userLocation.city}, ${userLocation.province}`
          : userProfileForm.formatted_location, // Keep existing value as fallback
      });
    }
    setIsBasicInfoEditable(false);
  };

  // Function to cancel credentials editing
  const handleCancelCredentialsEdit = () => {
    setUserCredentials({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    // Exit edit mode
    setIsCredentialsEditable(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View className="mt-2 flex flex-row items-center justify-between px-3">
        <Text className="text-xl font-bold">Profile</Text>
        <TouchableOpacity activeOpacity={1} onPress={handleLogout}>
          <LogOut size={25} color="#FF4D4F" />
        </TouchableOpacity>
      </View>
      <View className="flex-1">
        <View className="flex-row justify-center mt-4 relative">
          <View className={`h-44 ${isCameraEditable ? "w-[250px]" : "w-44"} `}>
            <Image
              source={
                profileImage && profileImage
                  ? { uri: profileImage }
                  : require("../../assets/images/no-image.jpg")
              }
              className={`h-44 w-44 mb-6 rounded-full border-2 border-gray-300 ${
                isCameraEditable ? "ml-[50px]" : ""
              }`}
              resizeMode="contain"
            />
            <View className="absolute bottom-2 right-1 flex-row gap-x-3">
              {isCameraEditable ? (
                <>
                  <TouchableOpacity
                    activeOpacity={1}
                    className="bg-white p-2 rounded-full border border-gray-300"
                    onPress={async () => {
                      await handleSelectImage();
                      setIsCameraEditable(false);
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#89C47E" />
                    ) : (
                      <Camera size={20} color="#89C47E" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={1}
                    className="bg-white p-2 rounded-full border border-gray-300 mr-2"
                    onPress={() => setIsCameraEditable(false)}
                    disabled={isUploading}
                  >
                    <X size={20} color="#FF4D4F" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  className="bg-white p-2 rounded-full border border-gray-300"
                  onPress={() => setIsCameraEditable(true)}
                >
                  <PencilLine size={20} color="#89C47E" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View className="mt-4">
          <Text className="text-center font-bold text-2xl">
            {user?.first_name} {user?.middle_name} {user?.last_name}
          </Text>
          <Text className="text-center font-medium  text-textSecondary py-1">
            {user?.email}
          </Text>
          <View className="bg-accent rounded-full px-3  mt-2 mx-auto">
            <Text className="text-center font-medium  text-textSecondary py-1">
              {userType}
            </Text>
          </View>
        </View>
        <View
          className="bg-card mt-10 rounded-t-[45px] flex-1 "
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 10, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
            overflow: "hidden",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              className=""
              contentContainerStyle={{
                paddingBottom: 40,
                paddingTop: 10,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Basic information */}
              <View className="flex flex-row mt-10 justify-between items-center">
                <View>
                  <Text className="font-bold text-2xl px-3">
                    Basic Information
                  </Text>
                </View>
                <View className="flex-row mr-4">
                  {isBasicInfoEditable && (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={handleCancelBasicInfoEdit}
                      className="mr-3"
                    >
                      <X size={25} color="#FF4D4F" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={async () => {
                      if (isBasicInfoEditable) {
                        await handleUpdateBasicInformation();
                      } else {
                        setIsBasicInfoEditable(true);
                      }
                    }}
                  >
                    {isBasicInfoEditable ? (
                      <Check size={25} color="#89C47E" />
                    ) : (
                      <PencilLine size={25} color="#89C47E" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mt-3 px-3">
                {/* First name */}
                <Text className="py-1 px-1 text-lg">
                  First name
                  <Text className="text-red-500"> *</Text>
                </Text>
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <User size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isBasicInfoEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="First name"
                    value={userProfileForm.first_name}
                    onChangeText={(text) =>
                      setUserProfileForm((prev) => ({
                        ...prev,
                        first_name: text,
                      }))
                    }
                  />
                </View>

                {/* Middle name */}
                <Text className="py-1 px-1 text-lg">
                  Middle name
                  <Text className="text-red-500"> *</Text>
                </Text>
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <User size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isBasicInfoEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Middle name"
                    value={userProfileForm.middle_name}
                    onChangeText={(text) =>
                      setUserProfileForm((prev) => ({
                        ...prev,
                        middle_name: text,
                      }))
                    }
                  />
                </View>

                {/* Last name */}
                <Text className="py-1 px-1 text-lg">
                  Last name
                  <Text className="text-red-500"> *</Text>
                </Text>
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <User size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isBasicInfoEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Last name"
                    value={userProfileForm.last_name}
                    onChangeText={(text) =>
                      setUserProfileForm((prev) => ({
                        ...prev,
                        last_name: text,
                      }))
                    }
                  />
                </View>

                {/* Contact number */}
                <Text className="py-1 px-1 text-lg">
                  Contact number
                  <Text className="text-red-500"> *</Text>
                </Text>
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <Phone size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isBasicInfoEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Contact number"
                    value={userProfileForm.contact}
                    onChangeText={(text) =>
                      setUserProfileForm((prev) => ({
                        ...prev,
                        contact: text,
                      }))
                    }
                  />
                </View>

                {/* Email */}
                <Text className="py-1 px-1 text-lg">
                  Email
                  <Text className="text-red-500"> *</Text>
                </Text>
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <Mail size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isBasicInfoEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Email"
                    value={userProfileForm.email}
                    onChangeText={(text) =>
                      setUserProfileForm((prev) => ({ ...prev, email: text }))
                    }
                  />
                </View>

                {/* Location */}
                <Text className="py-1 px-1 text-lg">
                  Location
                  <Text className="text-red-500"> *</Text>
                </Text>

                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <MapPin size={25} color="#89C47E" className="mr-4" />
                  {isBasicInfoEditable ? (
                    <TouchableOpacity
                      activeOpacity={1}
                      className="flex-1 h-full flex-row items-center justify-between"
                      onPress={() => setIsModalVisible(true)}
                    >
                      <Text className="text-lg ml-2 text-black">
                        {capitalizeWords(userProfileForm.formatted_location) ||
                          "Select Location"}
                      </Text>
                      <ChevronDown size={20} color="#666666" />
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-1 h-full flex-row items-center justify-between">
                      <Text className="text-lg ml-2 text-black">
                        {capitalizeWords(userProfileForm.formatted_location)}
                      </Text>
                      <ChevronDown size={20} color="#666666" />
                    </View>
                  )}
                </View>

                <Modal
                  visible={isModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setIsModalVisible(false)}
                >
                  <View className="flex-1 bg-black/30 justify-center items-center">
                    <View className="bg-white w-[90%] rounded-lg p-4 max-h-[70%]">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold">
                          Select Location
                        </Text>
                        <TouchableOpacity
                          onPress={() => setIsModalVisible(false)}
                        >
                          <X size={24} color="#666666" />
                        </TouchableOpacity>
                      </View>

                      {/* Location List */}
                      <FlatList
                        data={location}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={1}
                            className="px-4 py-2 border-b border-gray-200 last:border-b-0"
                            onPress={() => {
                              setUserProfileForm((prev) => ({
                                ...prev,
                                formatted_location: `${item.barangay}, ${item.city}, ${item.province}`,
                                location_id: item.id,
                              }));
                              setIsModalVisible(false);
                            }}
                          >
                            <Text className="text-black text-lg">
                              {capitalizeWords(item.barangay)},{" "}
                              {capitalizeWords(item.city)},{" "}
                              {capitalizeWords(item.province)}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </Modal>
              </View>

              {/* Credentials */}
              <View className="flex flex-row mt-10 justify-between items-center">
                <View>
                  <Text className="font-bold text-2xl px-3">Credentials</Text>
                </View>
                <View className="flex-row mr-4">
                  {isCredentialsEditable && (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={handleCancelCredentialsEdit}
                      className="mr-3"
                    >
                      <X size={25} color="#FF4D4F" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={async () => {
                      if (isCredentialsEditable) {
                        await handleUpdateCredentials();
                      } else {
                        setIsCredentialsEditable(true);
                      }
                    }}
                  >
                    {isCredentialsEditable ? (
                      <Check size={25} color="#89C47E" />
                    ) : (
                      <PencilLine size={25} color="#89C47E" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mt-3 px-3">
                {/* Old password */}
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <LockKeyhole size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isCredentialsEditable}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Old password"
                    secureTextEntry={!passwordVisibility.old}
                    value={userCredentials.old_password}
                    onChangeText={(text) =>
                      setUserCredentials((prev) => ({
                        ...prev,
                        old_password: text,
                      }))
                    }
                  />
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => togglePasswordVisibility("old")}
                  >
                    {passwordVisibility.old ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* New password */}
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <LockKeyhole size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isCredentialsEditable}
                    secureTextEntry={!passwordVisibility.new}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="New password"
                    value={userCredentials.new_password}
                    onChangeText={(text) =>
                      setUserCredentials((prev) => ({
                        ...prev,
                        new_password: text,
                      }))
                    }
                  />
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => togglePasswordVisibility("new")}
                  >
                    {passwordVisibility.new ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Confirm new password */}
                <View className="flex flex-row items-center h-14 border border-gray-300 rounded-lg px-4 mb-4 bg-white">
                  <LockKeyhole size={25} color="#89C47E" className="mr-4" />
                  <TextInput
                    editable={isCredentialsEditable}
                    secureTextEntry={!passwordVisibility.confirm}
                    className="flex-1 h-full text-lg ml-2"
                    placeholder="Confirm new password"
                    value={userCredentials.confirm_password}
                    onChangeText={(text) =>
                      setUserCredentials((prev) => ({
                        ...prev,
                        confirm_password: text,
                      }))
                    }
                  />
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => togglePasswordVisibility("confirm")}
                  >
                    {passwordVisibility.confirm ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}
