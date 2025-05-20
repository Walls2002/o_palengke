import { data } from "@/api/vendor/vendorApi";
import { Order } from "@/types/Order";
import { Store } from "@/types/Product";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, ScrollView, Button, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';



export default function OrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [riderTeamOnly, setRiderTeamOnly] = useState("1");

  const [filters, setFilters] = useState({
    show_pending: 1,
    show_confirmed: 1,
    show_delivered: 1,
    show_canceled: 1,
  });

  const statusList = [
    { id: 1, name: 'Pending', key: 'show_pending' },
    { id: 2, name: 'Confirmed', key: 'show_confirmed' },
    { id: 3, name: 'Delivered', key: 'show_delivered' },
    { id: 4, name: 'Cancelled', key: 'show_canceled' },
  ];


  useEffect(() => {
    fetchData();
  }, [storeId, filters]);

  useEffect(() => {
    fetchStores();
  }, []);


  const handleStatusChange = (selectedKey) => {
    let params = { [selectedKey]: 1 };

    if (selectedKey === 'show_confirmed') {
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
  }
  const fetchData = async () => {
    const response = await data.vendorStore(storeId, filters);
    setOrders(response.orders);
  };

  const handleOrders = async (orderId: number, type: string) => {
    if (type === "confirm") {
      await data.vendorConfirm(orderId);
    } else if (type === "dispatch") {
      await data.vendorDispatch(orderId, riderTeamOnly);
    } else if (type === "cancel") {
      await data.vendorCancel(orderId);
    }
    fetchData();
  }




  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4">
      <ScrollView className="w-full space-y-6">
        <View className="flex my-3 bg-gray-100">
          <Text className="text-xl font-bold mb-3">Select Store</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {stores && stores.map((item) => {
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
                      className={`pb-1 border-b-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                    >

                      <Text className={`text-lg font-bold text-center ${isSelected ? 'text-blue-500' : 'text-gray-800'}`}>
                        {item.store_name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>

        </View>
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
                    className={`pb-1 border-b-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <View className="bg-white p-2 rounded-lg shadow-lg">
                      <Text className={`text-lg font-bold text-center text-gray-800 ${isSelected ? 'text-blue-500' : 'text-gray-800'}`}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
        {!storeId ? (
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
                <Text className="text-xl font-semibold text-blue-600">
                  {order.customer.first_name} {order.customer.middle_name} {order.customer.last_name}
                </Text>
                <Text>{order.customer.contact} | {order.customer.email}</Text>
                <Text>Address: {order.address}</Text>
                <Text>Note: {order.note || ""}</Text>

                <Modal
                  transparent={true}
                  visible={isModalVisible}
                  animationType="slide"
                  onRequestClose={() => setIsModalVisible(false)}
                >
                  <TouchableOpacity
                    className="flex-1 justify-center items-center bg-gray-600 bg-opacity-50"
                    onPress={() => setIsModalVisible(false)}
                  >
                    {/* Modal content can go here */}
                  </TouchableOpacity>
                </Modal>

                <View className="p-3 border border-gray-300 mt-4">
                  {order.items.map((product, index) => (
                    <View key={index} className="flex-row justify-between mb-3">
                      <View className="mb-3">
                        <Text className="text-blue-600">{product.name} - ₱{product.total_cost}</Text>
                        <Text>Quantity: {product.quantity}</Text>
                      </View>
                    </View>
                  ))}
                  <Text className="text-xl font-semibold mt-4">Order Summary</Text>
                  <Text className="font-bold">Subtotal: ₱{order.total_item_price}</Text>
                  <Text className="font-bold">Delivery Fee: ₱{order.shipping_fee}</Text>
                  <Text className="font-bold">Discount: ₱{order.discount}</Text>
                  <Text className="font-bold">Total: ₱{order.final_price}</Text>




                  <View className="flex-row justify-between mt-4">
                    {selectedStatus === "show_confirmed" ? (
                      <View className="flex flex-col">
                        <Text className="pt-3">
                          Rider:{" "}
                          {order?.rider?.user?.first_name
                            ? `${order.rider.user.first_name} ${order.rider.user.middle_name || ""} ${order.rider.user.last_name || ""} ${order.rider.user.contact || ""}`
                            : "Currently waiting for a rider to accept delivery."}
                        </Text>

                        {order.rider_team_only == null && (
                          <View className="flex-col space-y-2 mt-4">
                            <View className="w-[250px] border border-gray-300 rounded-md px-2">
                              <Picker
                                selectedValue={riderTeamOnly}
                                onValueChange={(itemValue) => setRiderTeamOnly(itemValue)}
                                mode="dropdown"
                              >
                                <Picker.Item label="Dispatch to Store Riders Only" value="1" />
                                <Picker.Item label="Dispatch to All Riders in the Area" value="0" />
                              </Picker>
                            </View>

                            <View className="w-[250px]">
                              <Button
                                title="Dispatch Order"
                                onPress={() => handleOrders(Number(order.id), "dispatch")}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    ) : selectedStatus === "show_pending" ? (
                      <View className="space-y-2">
                        <Button
                          title="Confirm Order"
                          onPress={() => handleOrders(Number(order.id), "confirm")}
                        />
                        <Button
                          title="Cancel Order"
                          onPress={() => handleOrders(Number(order.id), "cancel")}
                        />
                      </View>
                    ) : selectedStatus === "show_delivered" ? (
                      <TouchableOpacity
                      activeOpacity={1}
                      className="flex-1 h-full flex-row items-center justify-between"
                      onPress={() => setIsModalVisible(true)}
                    >
                      <Text className="text-lg ml-2 text-black">
                       
                      </Text>
                    </TouchableOpacity>

                    ) : null}
                  </View>

                </View>
              </View>
            </View>

          ))
        )}
 <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-gray-600 bg-opacity-50"
          onPress={() => setIsModalVisible(false)}
        >
          {/* Modal content can go here */}
        </TouchableOpacity>
      </Modal>
      </ScrollView>
     

    </SafeAreaView>
  );
}