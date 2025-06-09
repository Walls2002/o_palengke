import React, { useCallback, useState } from "react";
import { Text, View, FlatList, RefreshControl } from "react-native";
import { useOrderContext } from "@/provider/OrderProvider";
import { Store, Bike } from "lucide-react-native";
import { Order, ProcessedOrder, Rider } from "@/types/OrderItem";

const ConfirmedScreen = () => {
  const { confirmedOrders, fetchConfirmedOrders } = useOrderContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call the fetch function
    if (typeof fetchConfirmedOrders === "function") {
      fetchConfirmedOrders();
    }
    // Force the loading indicator to disappear after 3 seconds
    console.log("Refreshing confirmed orders...");
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [fetchConfirmedOrders]);

  // Process orders to add rider info
  const processedOrders: ProcessedOrder[] =
    confirmedOrders.map((order: Order) => {
      let riderName = "Awaiting rider assignment";
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
    }) ?? [];

  // Render function for individual order
  const renderOrder = ({ item: order }: { item: ProcessedOrder }) => {
    const storeName = order.store?.store_name || "Unknown Store";
    const contactNumber = order.store?.contact_number || null;

    // Calculate prices for this specific order
    const subTotal = parseFloat(order.total_item_price || "0");
    const deliveryFee = parseFloat(order.shipping_fee || "0");
    const discount = parseFloat(order.discount || "0");
    const totalPrice = parseFloat(order.final_price || "0");

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
              Rider: {order.riderInfo.name}
            </Text>
            <Text
              className="font-regular text-sm text-textSecondary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order.riderInfo.contact}
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
                  {item.name ?? ""}
                </Text>
                <Text className="font-medium text-primary text-xl">
                  ₱{parseFloat(item.total_cost ?? "0").toFixed(2)}
                </Text>
              </View>
              <View className="flex flex-row justify-end">
                <Text className="font-medium text-textSecondary py-1">
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
        keyExtractor={(item: ProcessedOrder) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              No confirmed orders available.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ConfirmedScreen;
