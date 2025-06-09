import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { Store, MapPin, Phone, X } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { ShoppingCart } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cartApi } from "@/api/customer/cartApi";
import { useCart } from "@/provider/CartProvider";
import { useAuth } from "@/provider/AuthProvider";
import capitalizeWords from "@/utils/formatString";

const ProductDetail = () => {
  // States
  const { user } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const weights = [
    { label: "1/4 kilo", value: 0.25 },
    { label: "1/2 kilo", value: 0.5 },
    { label: "1 kilo", value: 1 },
  ];
  const [quantity, setQuantity] = useState<string>("1");
  const [selectedWeight, setSelectedWeight] = useState<{
    label: string;
    value: number;
  }>({
    label: "1 kilo",
    value: 1,
  });
  const { product } = useLocalSearchParams();
  const { refreshCart } = useCart();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const productData = React.useMemo(() => {
    try {
      return typeof product === "string" ? JSON.parse(product) : null;
    } catch (error) {
      console.error("Error parsing product data:", error);
      return null;
    }
  }, [product]);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Event Handlers
  const navigateBack = () => {
    router.back();
  };

  const selectWeight = (weight: { label: string; value: number }) => {
    setSelectedWeight(weight);
    setIsDropdownOpen(false);
  };

  const handleAddToCart = async () => {
    if (!productData?.id || !user) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Invalid product or user data",
        visibilityTime: 3000,
      });
      return;
    }

    const qty = parseInt(quantity) || 1;
    if (qty <= 0) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Quantity must be greater than 0",
        visibilityTime: 3000,
      });
      return;
    }

    // Check if quantity exceeds available stock
    if (qty > (productData.quantity || 0)) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Quantity exceeds available stock.",
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 15,
          fontWeight: "semibold",
        },
        visibilityTime: 3000,
      });
      return;
    }

    let payload: any = { quantity: qty };

    if (productData?.measurement?.toLowerCase() === "kilo") {
      payload.kilo_measurement = selectedWeight.value;
    }

    try {
      await cartApi.addItemToCart(productData.id, payload, user);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Item added to cart!",
        text2: "You can view it in your cart.",
        visibilityTime: 3000,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 15,
          fontWeight: "semibold",
        },
      });
      await refreshCart();
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Failed to add item to cart.",
        visibilityTime: 3000,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 15,
          fontWeight: "semibold",
        },
      });
    }
  };

  const getProductImage = () => {
    if (!productData?.image) {
      return require("../../assets/images/no-image.jpg");
    }

    if (productData.image.startsWith("http")) {
      return { uri: productData.image };
    }

    return {
      uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${productData.image}`,
    };
  };

  if (!productData) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg">Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1">
            <View className="flex flex-row items-center px-2">
              <ChevronLeft size={26} color="black" onPress={navigateBack} />
              <View className="flex-1 items-center justify-center">
                <Text className="text-2xl font-bold">Product Detail</Text>
              </View>
            </View>
            <View className="mt-10">
              <View
                className="bg-card mx-auto rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  shadowColor: "#1F1F1F",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
              >
                <Image
                  source={getProductImage()}
                  style={{
                    width: screenWidth * 0.92,
                    height: screenHeight * 0.5,
                  }}
                  className="w-full"
                  resizeMode="cover"
                />
              </View>
              <View className="px-4 mt-4">
                <View className="flex flex-row items-center mt-8">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2 flex-row gap-x-2">
                      <Store size={24} color={"#285A2C"} className="mr-2" />
                      <Text
                        className="text-xl sm:text-lg font-bold"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {productData?.store?.store_name || "Unknown Store"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mr-2 flex-row gap-x-2 mt-2">
                  <MapPin size={22} color={"#666666"} className="mr-2" />
                  <Text
                    className="text-lg sm:text-md font-regular text-textSecondary"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {capitalizeWords(productData?.store?.location?.barangay) ||
                      "Unknown Barangay"}{" "}
                    {capitalizeWords(productData?.store?.location?.city) ||
                      "Unknown City"}{" "}
                    {capitalizeWords(productData?.store?.location?.province) ||
                      "Unknown Province"}
                  </Text>
                </View>
                <View className="mr-2 flex-row gap-x-2 mt-2">
                  <Phone size={22} color={"#666666"} className="mr-2" />
                  <Text
                    className="text-lg sm:text-md font-regular text-textSecondary"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {productData?.store?.contact_number || 0}
                  </Text>
                </View>
              </View>
            </View>
            <View
              className="flex-1 bg-card mt-10 rounded-t-[45px] px-6 pt-10 min-h-[350px]"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 12, height: -2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 15,
                overflow: "hidden",
              }}
            >
              <View className="flex-row justify-between items-start">
                {/* Product name - reduced width and responsive text */}
                <View className="flex-1 mr-2 flex-row gap-x-2">
                  <Text
                    className="text-2xl sm:text-lg font-bold text-black"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {productData?.name || ""}
                  </Text>
                </View>
                <Text className="text-2xl font-bold shrink-0 text-black">
                  ₱{productData?.price || 0}
                </Text>
              </View>
              {/* Available  */}
              <Text className="py-1 text-xl text-black">
                {productData?.quantity || 0}{" "}
                {productData?.measurement || "units"} left
              </Text>
              {/* Quantity */}
              <View className="flex justify-between flex-row items-center mt-10">
                <Text className="text-lg text-black">Quantity</Text>
                <TextInput
                  readOnly={Number(productData?.quantity) === 0}
                  value={quantity}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    setQuantity(numericText);
                  }}
                  className="w-[150px] h-12 border border-gray-300 bg-white rounded-lg px-4"
                  keyboardType="number-pad"
                />
              </View>
              {/* Weight */}
              <View className="flex justify-between flex-row items-center mt-4">
                <Text className="text-lg text-black">Weight</Text>
                <View className="relative w-[150px]">
                  <TouchableOpacity
                    disabled={Number(productData?.quantity) === 0}
                    activeOpacity={1}
                    className="w-full h-12 border border-gray-300 bg-white rounded-lg px-4 justify-center"
                    onPress={() => setIsModalVisible(true)}
                  >
                    <Text>{selectedWeight?.label}</Text>
                  </TouchableOpacity>
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
                        <Text className="text-lg font-bold">Select Weight</Text>
                        <TouchableOpacity
                          onPress={() => setIsModalVisible(false)}
                        >
                          <X size={24} color="#666666" />
                        </TouchableOpacity>
                      </View>

                      {/* Weight Selection */}
                      <FlatList
                        data={weights}
                        keyExtractor={(item) => item.value.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            className="px-4 py-2 border-b border-gray-200 last:border-b-0"
                            onPress={() => {
                              selectWeight(item);
                              setIsModalVisible(false);
                            }}
                          >
                            <Text>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </Modal>
              </View>
              <View className="flex justify-center flex-row items-center mt-[50px] pb-10">
                <TouchableOpacity
                  disabled={Number(productData?.quantity) === 0}
                  onPress={handleAddToCart}
                  activeOpacity={1}
                  className={`px-4 py-2 rounded-lg w-[250px] h-14 ${
                    Number(productData?.quantity) === 0
                      ? "bg-red-500"
                      : "bg-primary"
                  }`}
                >
                  <View className="flex flex-row justify-center items-center h-full">
                    <ShoppingCart
                      size={20}
                      color={"#F0F0F0"}
                      className="mr-2"
                    />
                    <Text className="text-white text-lg font-medium ml-3">
                      {Number(productData?.quantity) === 0
                        ? "Out of Stock"
                        : "Add to cart"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProductDetail;
