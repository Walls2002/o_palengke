import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Store, User } from "lucide-react-native";
import { deliveryApi } from "@/api/rider/deliveryApi";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { useOrders } from "@/provider/DeliveryOrderProvider";
import { localOrderApi } from "@/api/rider/localOrderApi";

const DeliveryScreen = () => {
  const { orders, loading, fetchForDeliveryOrders } = useOrders();
  const [error, setError] = useState<unknown>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const openImagePickerAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        "Cancel Order",
        "Are you sure you want to cancel this order?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => resolve(), // Cancelled
          },
          {
            text: "Yes",
            onPress: async () => {
              try {
                const response = await localOrderApi.cancelLocalOrder(orderId);
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: response.message || "Order cancelled successfully.",
                  text1Style: {
                    fontSize: 18,
                    fontWeight: "bold",
                  },
                  text2Style: {
                    fontSize: 16,
                    fontWeight: "600",
                  },
                });

                fetchForDeliveryOrders();
                resolve();
              } catch (err: any) {
                console.log("Error accepting order:", err);
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2:
                    err.message ||
                    "An error occurred while cancelling the order.",
                  text1Style: {
                    fontSize: 18,
                    fontWeight: "bold",
                  },
                  text2Style: {
                    fontSize: 16,
                    fontWeight: "600",
                  },
                });
                resolve();
              }
            },
          },
        ],
        { cancelable: false }
      );
    });
  };

  const uploadImageAndMarkDelivered = async () => {
    if (!image || !selectedOrderId) return;

    const formData = new FormData();
    formData.append("image", {
      uri: image.uri,
      type: "image/jpeg",
      name: "proof.jpg",
    } as any);

    try {
      const response = await deliveryApi.uploadProofOfDelivery(
        selectedOrderId,
        formData
      );

      if (response.data.message === "Order delivered.") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Order marked as delivered.",
        });
        fetchForDeliveryOrders();
        setModalVisible(false);
        setImage(null);
        setSelectedOrderId(null);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to mark as delivered.",
        });
        setImage(null);
        setModalVisible(false);
      }
      fetchForDeliveryOrders();
    } catch (error) {
      setImage(null);
      setModalVisible(false);
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while uploading.",
      });
    }
  };

  const handleMarkAsDelivered = (orderId: number) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View className="bg-card rounded-lg p-4 shadow-sm mt-2">
      {/* Customer Info */}
      <View className="flex flex-row items-center mb-2 gap-x-2 justify-between">
        <View className="flex flex-row items-center">
          <User size={24} color={"#285A2C"} className="mr-2" />
          <Text className="text-xl font-bold py-1 text-primary">
            {item.customer.first_name} {item.customer.middle_name}{" "}
            {item.customer.last_name}
          </Text>
        </View>
        <View className="bg-[#007BFF] rounded-full px-2">
          <Text className=" font-medium text-white py-1">
            {item.status?.name}
          </Text>
        </View>
      </View>
      <Text className="py-1">
        {item.customer.contact} | {item.customer.email}
      </Text>
      <Text className="py-1">Address: {item.address}</Text>
      <Text className="py-1">Note: {item.note || "No notes provided"}</Text>

      {/* Store Info */}
      <View className="px-4">
        <View className="flex flex-row items-center mb-2 gap-x-2 mt-4">
          <Store size={24} color={"#000"} className="mr-2" />
          <Text className="font-bold text-lg text-black">
            Store: {item.store.store_name}
          </Text>
        </View>
        <View className="bg-divider h-[3px] mt-2" />

        {/* Items */}
        {item &&
          item.items.map((product: any, index: number) => {
            return (
              <View key={index}>
                <View className="flex flex-row items-center justify-between gap-x-2 mt-2">
                  <Text className="py-1 text-primary text-lg font-medium">
                    {product.name}
                  </Text>
                  <Text className="text-primary text-lg font-medium">
                    ₱{product.unit_price}
                  </Text>
                </View>
                <View className="flex flex-row items-center justify-end gap-x-2">
                  <Text className="text-primary text-lg font-medium">
                    x {product.quantity}
                  </Text>
                </View>
              </View>
            );
          })}

        {/* Order Summary */}
        <View className="mt-8 flex justify-end">
          <Text className="text-lg font-bold text-right">Order Summary</Text>
          <Text className="font-medium text-right py-1">
            Subtotal: ₱{item.total_item_price}
          </Text>
          <Text className="font-medium text-right py-1">
            Delivery fee: ₱{item.shipping_fee}
          </Text>
          <Text className="font-medium text-right py-1">
            Discount: ₱{item.discount}
          </Text>
          <Text className="font-medium text-right py-1">
            Total: ₱{item.final_price}
          </Text>
          <View className="flex flex-row justify-end mt-3">
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleMarkAsDelivered(item.id)}
              style={{ marginRight: 10 }}
            >
              <View
                className="bg-primary h-11 px-5 rounded-md flex justify-center items-center"
                style={{ minWidth: 150 }}
              >
                <Text className="text-lg font-semibold text-white">
                  Mark as Delivered
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                handleCancelOrder(item.id);
              }}
            >
              <View
                className="bg-red-500 h-11 px-5 rounded-md flex justify-center items-center"
                style={{ minWidth: 150 }}
              >
                <Text className="text-lg font-semibold text-white">
                  Cancel Delivery Order
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
  return (
    <SafeAreaView className="px-3 flex-1">
      <View className="mt-2 flex flex-row items-center justify-between">
        <Text className="text-xl font-bold">For Delivery</Text>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#285A2C" />
        </View>
      ) : orders && orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">No Orders Available.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-5 w-[90%]">
            <Text className="text-lg font-bold mb-2">
              Upload Delivery Proof
            </Text>
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={{
                  width: "100%",
                  height: 200,
                  marginBottom: 10,
                  borderRadius: 10,
                }}
              />
            ) : (
              <TouchableOpacity
                onPress={openImagePickerAsync}
                className="bg-gray-200 p-4 rounded-lg mb-4"
              >
                <Text className="text-center text-black">Pick an Image</Text>
              </TouchableOpacity>
            )}
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-red-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={uploadImageAndMarkDelivered}>
                <Text className="text-green-600 font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
