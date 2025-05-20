import { data } from "@/api/vendor/vendorApi";
import { Order, VendorOrder } from "@/types/Order";
import { Store } from "@/types/Product";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';
import Toast from "react-native-toast-message";

export default function OrderScreen() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [riderTeamOnly, setRiderTeamOnly] = useState("1");
  const [isLoading, setIsLoading] = useState(false);


  const [filters, setFilters] = useState<Partial<{
    show_pending: number;
    show_confirmed: number;
    show_delivered: number;
    show_canceled: number;
  }>>({
    show_pending: 1,
    show_confirmed: 1,
    show_delivered: 1,
    show_canceled: 1,
  });


  const statusList = [
    { id: 1, name: "Pending", key: "show_pending" },
    { id: 2, name: "Confirmed", key: "show_confirmed" },
    { id: 3, name: "Delivered", key: "show_delivered" },
    { id: 4, name: "Cancelled", key: "show_canceled" },
  ];

  useEffect(() => {
    if (storeId) {
      fetchData();
    }
  }, [storeId, filters]);

  useEffect(() => {
    fetchStores();
  }, []);

  const handleStatusChange = (selectedKey: string) => {
    let params = { [selectedKey]: 1 };

    if (selectedKey === "show_confirmed") {
      params = {
        show_confirmed: 1,
        show_assigned: 1,
        show_dispatched: 1,
      };
    }

    setFilters(params);
    setSelectedStatus(selectedKey);
  };

  const fetchStores = async () => {
    const response = await data.vendorStoreList();
    setStores(response.stores);
  };

  const fetchData = async () => {
    setIsLoading(false); // Start loading
    try {
      const response = await data.vendorStore(storeId as number, filters);
      setOrders(response.orders);
    } catch (error) {
      console.error("Error fetching orders test:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleOrders = async (orderId: number, type: string) => {
    if (type === "confirm") {
      await data.vendorConfirm(orderId);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Order confirmed successfully",
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
    } else if (type === "dispatch") {
      await data.vendorDispatch(orderId, riderTeamOnly);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Order dispatched successfully",
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
    } else if (type === "cancel") {
      Toast.show({
        type: "success",
        position: "top",
        text1: "Order cancelled successfully",
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
      await data.vendorCancel(orderId);
    }
    fetchData();
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4">
      <ScrollView className="w-full space-y-6">
        {/* Store Selection */}
        <View className="flex my-3 bg-gray-100">
          <Text className="text-xl font-bold mb-3">Select Store</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {stores.map((item) => {
                const isSelected = item.id === storeId;
                return (
                  <View
                    key={item.id}
                    className="bg-white p-2 rounded-lg shadow-lg"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setStoreId(item.id);
                        setFilters({
                          show_pending: 1,
                          show_confirmed: 0,
                          show_delivered: 0,
                          show_canceled: 0,
                        });
                        setSelectedStatus("show_pending");
                      }}
                      className={`pb-1 border-b-2 ${
                        isSelected ? "border-[#337037]" : "border-transparent"
                      }`}
                    >
                      <Text
                        className={`text-lg font-bold text-center ${
                          isSelected ? "text-[#337037]" : "text-gray-800"
                        }`}
                      >
                        {item.store_name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Status Filter */}
        <View className="flex my-3 bg-gray-100">
          <Text className="text-xl font-bold mb-3">Select Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {statusList.map((item) => {
                const isSelected = item.key === selectedStatus;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleStatusChange(item.key)}
                    className={`pb-1 border-b-2 ${
                      isSelected ? "border-[#337037]" : "border-transparent"
                    }`}
                  >
                    <View className="bg-white p-2 rounded-lg shadow-lg">
                      <Text
                        className={`text-lg font-bold text-center ${
                          isSelected ? "text-[#337037]" : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Order Display */}

        {isLoading ? (
          <View className="items-center mt-5">
            <ActivityIndicator size="large" color="#337037" />
          </View>
        ) : !storeId ? (
          <View className="items-center mt-5">
            <Text>Please select a store first.</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="items-center mt-5">
            <Text className="text-lg">No orders available for this store.</Text>
            <Text>Please check back later.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} className="bg-white shadow-md mb-4 rounded-lg">
              <View className="p-5">
                <Text className="text-xl font-semibold text-[#337037]">
                  {order.customer.first_name} {order.customer.middle_name}{" "}
                  {order.customer.last_name}
                </Text>
                <Text>
                  {order.customer.contact} | {order.customer.email}
                </Text>
                <Text>Address: {order.address}</Text>
                <Text>Note: {order.note || ""}</Text>

                <View className="p-3 border border-gray-300 mt-4">
                  {order.items.map((product, index) => (
                    <View key={index} className="flex-row justify-between mb-3">
                      <View className="mb-3">
                        <Text className="text-[#337037]">
                          {product.name} - ₱{product.total_cost}
                        </Text>
                        <Text>Quantity: {product.quantity}</Text>
                      </View>
                    </View>
                  ))}
                  <Text className="text-xl font-semibold mt-4">
                    Order Summary
                  </Text>
                  <Text className="font-bold">
                    Subtotal: ₱{order.total_item_price}
                  </Text>
                  <Text className="font-bold">
                    Delivery Fee: ₱{order.shipping_fee}
                  </Text>
                  <Text className="font-bold">Discount: ₱{order.discount}</Text>
                  <Text className="font-bold">Total: ₱{order.final_price}</Text>

                  {/* Action Buttons */}
                  <View className="flex-row flex-wrap gap-3 mt-4">
                    {selectedStatus === "show_confirmed" && (
                      <View className="flex-col space-y-2">
                        <Text className="pt-3">
                          Rider:{" "}
                          {order?.rider?.user?.first_name
                            ? `${order.rider.user.first_name} ${
                                order.rider.user.middle_name || ""
                              } ${order.rider.user.last_name || ""} ${
                                order.rider.user.contact || ""
                              }`
                            : "Currently waiting for a rider to accept delivery."}
                        </Text>

                        {order.rider_team_only == null && (
                          <>
                            <View className="mt-2 w-[275px] border border-gray-300 rounded-md px-2">
                              <Picker
                                selectedValue={riderTeamOnly}
                                onValueChange={(itemValue) =>
                                  setRiderTeamOnly(itemValue)
                                }
                                mode="dropdown"
                              >
                                <Picker.Item
                                  label="Dispatch to Store Riders Only"
                                  value="1"
                                />
                                <Picker.Item
                                  label="Dispatch to All Riders in the Area"
                                  value="0"
                                />
                              </Picker>
                            </View>
                            <TouchableOpacity
                              className="bg-[#337037] p-3 rounded-lg items-center mt-2"
                              onPress={() =>
                                handleOrders(Number(order.id), "dispatch")
                              }
                            >
                              <Text className="text-white font-bold">
                                Dispatch Order
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )}

                    {selectedStatus === "show_pending" && (
                      <>
                        <TouchableOpacity
                          className="bg-[#337037] p-3 rounded-lg items-center"
                          onPress={() =>
                            handleOrders(Number(order.id), "confirm")
                          }
                        >
                          <Text className="text-white font-bold">
                            Confirm Order
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-[#337037] p-3 rounded-lg items-center"
                          onPress={() =>
                            handleOrders(Number(order.id), "cancel")
                          }
                        >
                          <Text className="text-white font-bold">
                            Cancel Order
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {selectedStatus === "show_delivered" && (
                      <TouchableOpacity
                        className="bg-[#337037] p-3 rounded-lg items-center"
                        onPress={() => {
                          const image = order.delivery_image || null;
                          const proofUrl = `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${image}`;
                          setProofImageUrl(proofUrl);
                          setIsModalVisible(true);
                        }}
                      >
                        <Text className="text-white font-bold">
                          View Proof of Delivery
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Modal for Proof of Delivery */}
        {isModalVisible && (
          <Modal
            transparent={true}
            visible={isModalVisible}
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
              <View className="bg-white p-4 rounded-md shadow-md items-center">
                <Text className="text-lg font-bold mb-2">
                  Proof of Delivery
                </Text>
                {proofImageUrl ? (
                  <Image
                    source={{ uri: proofImageUrl }}
                    style={{ width: 300, height: 400, resizeMode: "contain" }}
                  />
                ) : (
                  <Text>No proof image available.</Text>
                )}
                <TouchableOpacity
                  className="bg-[#337037] mt-4 px-4 py-2 rounded-lg"
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
