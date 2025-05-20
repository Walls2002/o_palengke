import { StoreList } from '@/types/Store';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { data } from '@/api/vendor/vendorApi';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StoreScreen() {
  const [stores, setStores] = useState<StoreList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(false); 
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true); 
    const response = await data.vendorStoreList();
    setStores(response.stores);
    setLoading(false); 
  };

  const handleClickProduct = (storeId: number) => {
    router.push({
      pathname: '/screen/vendor/products/[id]',
      params: { id: storeId },
    });
  };

  const handleClickRider = (storeId: number) => {
    router.push({
      pathname: '/screen/vendor/rider/[id]',
      params: { id: storeId },
    });
  };

  const handleCreate = () => {
    router.push('/screen/StoreForm');
  };

  const handleEdit = (store: StoreList) => {
    router.push({
      pathname: '/screen/StoreForm',
      params: { store: JSON.stringify(store) },
    });
  };

  const handleDelete = async (storeId: number) => {
    setLoading(true);
    await data.vendorStoreDelete(storeId);
    await fetchStores();
    setLoading(false);
    Toast.show({
      type: "success",
      position: "top",
      text1: "Deleted Successfully",
      visibilityTime: 3000,
    });
  };

  const filteredStores = stores.filter((store) =>
    Object.entries(store).some(([key, value]) => {
      if (key === 'is_verified') {
        const status = value ? 'Approved' : 'Pending';
        return status.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50">
        <View className="p-4">
          <TextInput
            placeholder="Search stores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm"
          />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#337037" />
            <Text className="text-gray-500 mt-2">Loading stores...</Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-base">No stores found+</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStores}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="bg-white p-4 mx-4 mb-3 rounded-xl border border-gray-200 shadow-sm">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{
                      uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${item.image}`,
                    }}
                    className="w-14 h-14 rounded-full mr-4"
                  />
                  <View>
                    <Text className="text-base font-semibold">{item.store_name}</Text>
                    <Text className="text-gray-500 text-sm">{item.contact_number}</Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-700 mb-0.5">
                  <Text className="font-medium">Address: </Text>{item.street}
                </Text>
                <Text className="text-sm text-gray-700 mb-0.5">
                  <Text className="font-medium">Shipping Fee: </Text>{item.location.shipping_fee}
                </Text>

                <Text
                  className={`text-sm font-medium mb-2 ${item.is_verified ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                  Status: {item.is_verified ? 'Approved' : 'Pending'}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    className="border border-green-500 px-3 py-1 rounded-lg"
                    onPress={() => handleEdit(item)}
                  >
                    <Text className="text-sm">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="border border-red-500 px-3 py-1 rounded-lg"
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text className="text-red-500 text-sm">Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="border border-blue-500 px-3 py-1 rounded-lg"
                    onPress={() => handleClickProduct(item.id)}
                  >
                    <Text className="text-blue-500 text-sm">Products</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="border border-blue-500 px-3 py-1 rounded-lg"
                    onPress={() => handleClickRider(item.id)}
                  >
                    <Text className="text-blue-500 text-sm">Riders</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20 }}>
          <TouchableOpacity
            onPress={handleCreate}
            className="bg-green-600 px-5 py-3 rounded-full shadow-lg">
            <Text className="text-white font-semibold text-sm">+ New Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>

  );
}
