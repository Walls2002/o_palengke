import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import Toast from "react-native-toast-message";
import { useOrderContext } from "@/provider/OrderProvider";
import { Store, Bike, X } from "lucide-react-native";
import { Order, ProcessedOrder, Rider } from "@/types/OrderItem";

const DeliveredScreen = () => {
  const { deliveredOrders, fetchDeliveredOrders } = useOrderContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call the fetch function
    if (typeof fetchDeliveredOrders === "function") {
      fetchDeliveredOrders();
    }

    // Force the loading indicator to disappear after 3 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [fetchDeliveredOrders]);

  //Handle view proof of delivery
  const handleViewProofOfDelivery = (deliveryImage: string | null) => {
    setImageLoadError(false);
    let formattedImage;

    if (deliveryImage) {
      if (deliveryImage.startsWith("http")) {
        formattedImage = deliveryImage;
      } else {
        formattedImage = `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${deliveryImage}`;
      }
      setSelectedImage(formattedImage);
      setModalVisible(true);
    } else {
      setImageLoadError(true);
      setModalVisible(true);

      Toast.show({
        type: "info",
        position: "top",
        text1: "No delivery image available",
        visibilityTime: 3000,
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
      });
    }
  };

  // Process orders to add rider info
  const processedOrders =
    (deliveredOrders &&
      deliveredOrders.map((order: Order) => {
        let riderName = "Not assigned";
        const rider = order.rider as Rider;

        if (rider?.user) {
          const { first_name = "", last_name = "", middle_name } = rider.user;
          riderName = `${first_name} ${last_name}`;
          if (middle_name) {
            riderName += ` ${middle_name}`;
          }
        }
        return {
          ...order,
          riderInfo: {
            name: riderName.trim() || "Not assigned",
            contact: (rider?.user?.contact as string) ?? "No contact",
          },
        };
      })) ??
    [];

  const renderOrder = ({ item: order }: { item: ProcessedOrder }) => {
    const storeName = order.store?.store_name || "Unknown Store";
    const contactNumber = order.store?.contact_number || null;
    const deliveryImage = order?.delivery_image || null;

    // Calculate prices for this specific order
    const subTotal = parseFloat(order.total_item_price ?? "0");
    const deliveryFee = parseFloat(order.shipping_fee ?? "0");
    const discount = parseFloat(order.discount ?? "0");
    const totalPrice = parseFloat(order.final_price ?? "0");

    return (
      <View className="mt-6">
        {/* Store Header */}
        <View className="flex flex-row items-center mb-2 gap-x-2 px-2">
          <Store size={24} color={"#285A2C"} className="mr-2" />
          <Text className="font-bold text-xl text-primary">
            Store: {storeName} {contactNumber && `| ${contactNumber}`}
          </Text>
        </View>
        <View className="flex-row items-center mb-2 gap-x-2 mt-2 px-2">
          <Bike size={24} color={"#666666"} className="mr-2 flex-shrink-0" />
          <View className="flex-1">
            <Text
              className="font-regular text-lg text-textSecondary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Rider: {order?.riderInfo?.name}
            </Text>
            <Text
              className="font-regular text-sm text-textSecondary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order?.riderInfo?.contact}
            </Text>
          </View>
        </View>
        {/* Order Items */}
        {order.items.map((item: any, itemIndex: number) => {
          return (
            <View
              key={itemIndex}
              className="bg-card rounded-md w-full shadow-sm p-3 py-4 flex flex-col mt-2"
            >
              <View className="flex flex-row justify-between">
                <Text className="font-medium text-primary text-xl">
                  {item.name || ""}
                </Text>
                <Text className="font-medium text-primary text-xl">
                  ₱{item?.total_cost ?? 0}
                </Text>
              </View>
              <View className="flex flex-row justify-end">
                <Text className="font-medium text-gray-600 py-1">
                  x {item.quantity ?? 0}
                </Text>
              </View>

              {/* {itemIndex < order.items.length - 1 && (
                <View className="w-full h-[1px] bg-[#E0E0E0] my-2" />
              )} */}
            </View>
          );
        })}

        {/* Order Total */}
        <View className="flex flex-col items-end justify-end mt-1 ">
          <Text className="font-bold text-lg mt-4">Order Summary</Text>
          <Text className="font-medium text-lg mt-2 text-textSecondary">
            Subtotal: ₱{subTotal.toFixed(2)}
          </Text>
          <Text className="font-medium text-lg mt-2 text-textSecondary">
            Delivery fee: ₱{deliveryFee.toFixed(2)}
          </Text>
          <Text className="font-medium text-lg mt-2 text-textSecondary">
            Discount: ₱{discount.toFixed(2)}
          </Text>
          <Text className="font-medium text-lg mt-2 text-textSecondary">
            Total: ₱{totalPrice.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            handleViewProofOfDelivery(deliveryImage);
          }}
          activeOpacity={1}
        >
          <View className="flex flex-row justify-end mt-4">
            <View className="bg-primary h-12 px-3 rounded-md flex justify-center items-center ml-3">
              <Text className="text-white font-medium">
                View Proof of Delivery
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* Divider */}
        <View className="bg-divider h-[3px] mt-2" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={processedOrders ?? []}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              No delivered orders available.
            </Text>
          </View>
        }
      />

      {/* Proof of Delivery Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-4 w-[90%] max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-primary">
                Proof of Delivery
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2"
              >
                <X size={24} color="#285A2C" />
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center">
              {selectedImage && !imageLoadError ? (
                <Image
                  source={{
                    uri: selectedImage,
                    headers: {
                      Accept: "image/jpeg, image/png, image/jpg",
                    },
                  }}
                  className="w-full h-72 rounded-md"
                  resizeMode="cover"
                  onError={(e) => {
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <>
                  <Image
                    source={require("../../assets/images/no-image.jpg")}
                    className="w-full h-72 rounded-md"
                    resizeMode="contain"
                  />
                  <Text className="mt-2 text-gray-500">
                    {imageLoadError
                      ? "Unable to load delivery image"
                      : "No delivery image available"}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeliveredScreen;
