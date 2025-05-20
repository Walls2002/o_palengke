import React, { useCallback, useState } from "react";
import { Text, View, FlatList, RefreshControl } from "react-native";
import { useOrderContext } from "@/provider/OrderProvider";
import { Store } from "lucide-react-native";
import { useAuth } from "@/provider/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Order } from "@/types/OrderItem";  

const PendingScreen = () => {
  const { pendingOrders, fetchPendingOrders } = useOrderContext();
  const { isLoading } = useAuth() as {
    isLoading: boolean;
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call the fetch function
    if (typeof fetchPendingOrders === "function") {
      fetchPendingOrders();
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [fetchPendingOrders]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const renderOrder = ({ item: order }: { item: Order }) => {
    const storeName = order.store?.store_name || "Unknown Store";
    const contactNumber = order.store?.contact_number || "No contact";

    // Calculate prices for this specific order
    const subTotal = parseFloat(order.total_item_price || "0");
    const deliveryFee = parseFloat(order.shipping_fee || "0");
    const discount = parseFloat(order.discount || "0");
    const totalPrice = parseFloat(order.final_price || "0");

    return (
      <View className="mt-6">
        {/* Store Header */}
        <View className="flex flex-row items-center mb-2 gap-x-2">
          <Store size={24} color={"#285A2C"} className="mr-2" />
          <Text className="font-bold text-xl text-primary">
            Store: {storeName} | {contactNumber}
          </Text>
        </View>

        {/* Order Items */}
        <View className="rounded-md w-full shadow-sm bg-card px-3 py-4 flex flex-col mt-2">
          {order.items.map((item: any, itemIndex: number) => {
            return (
              <View key={itemIndex} className="">
                <View className="flex flex-row justify-between">
                  <Text className="font-medium text-primary text-xl">
                    {item?.name || ""}
                  </Text>
                  <Text className="font-medium text-primary text-xl">
                    ₱{item?.total_cost ?? 0}
                  </Text>
                </View>
                <View className="flex justify-end flex-row">
                  <Text className="font-medium text-textSecondary text-lg">
                    x {item.quantity ?? 0}
                  </Text>
                </View>

                {itemIndex < order.items.length - 1 && (
                  <View className="w-full h-[1px] bg-[#E0E0E0] my-2" />
                )}
              </View>
            );
          })}
        </View>

        {/* Order Total */}
        <View className="flex flex-col items-end justify-end mt-1 mr-4">
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
        data={pendingOrders ?? []}
        keyExtractor={(item: Order) => item.id?.toString() || Math.random().toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No pending orders available.</Text>
          </View>
        }
      />
    </View>
  );
};

export default PendingScreen;
