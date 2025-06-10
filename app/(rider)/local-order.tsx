import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Store, User } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/provider/AuthProvider";
import { localOrderApi } from "@/api/rider/localOrderApi";
import { useOrders } from "@/provider/DeliveryOrderProvider";
const LocalOrderScreen = () => {
  const { fetchForDeliveryOrders } = useOrders();
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const fetchedOrders = await localOrderApi.fetchLocalOrders();
      setOrders(fetchedOrders);
      fetchForDeliveryOrders();
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  //Event handler
  const handleAcceptOrder = async (order: any) => {
    try {
      // Make the API call
      const response = await localOrderApi.acceptLocalOrders(order.id);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.message || "Order accepted successfully.",
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 16,
          fontWeight: "semibold",
        },
      });

      // Refresh the orders list
      fetchOrders(false);
      fetchForDeliveryOrders();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "An error occurred while accepting the order.",
        text1Style: {
          fontSize: 18,
          fontWeight: "bold",
        },
        text2Style: {
          fontSize: 16,
          fontWeight: "semibold",
        },
      });
    }
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
        <View className="bg-[##28A745] rounded-full px-2">
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
        {item.items.map((product: any, index: number) => {
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
              onPress={() => {
                handleAcceptOrder(item);
              }}
              style={{ marginRight: 10 }}
            >
              <View className="bg-primary h-11 px-5 rounded-md flex justify-center items-center">
                <Text className="text-lg font-semibold text-white">
                  Accept Delivery Order
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
        <Text className="text-xl font-bold">Local Orders</Text>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#285A2C" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">No Local Orders</Text>
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
    </SafeAreaView>
  );
};

export default LocalOrderScreen;
