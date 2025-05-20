import { StoreList } from '@/types/Store';
import { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
} from 'react-native';
import { data } from '@/api/vendor/vendorApi';
import { router } from 'expo-router';

export default function StoreScreen() {
    const [stores, setStores] = useState<StoreList[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        const response = await data.vendorStoreList();
        setStores(response.stores);
    };

    const handleClickProduct = (storeId: number) => {
        router.push({
            pathname: '/screen/vendor/products/[id]',
            params: { store_id: storeId },
        });
    };

    const handleClickRider = (storeId: number) => {
        router.push({
            pathname: '/screen/vendor/rider/[id]',
            params: { store_id: storeId },
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
        const response = await data.vendorStoreDelete(storeId);
        fetchStores();
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
        <View className="flex-1">
            <View className="p-4">
            <TextInput
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                />
            </View>

            {filteredStores.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600 text-xl">No stores found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStores}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 m-2 rounded-2xl shadow">
                            <View className="flex-row items-center mb-2">
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-16 h-16 rounded-full mr-4"
                                />
                                <View>
                                    <Text className="text-lg font-semibold">{item.store_name}</Text>
                                    <Text className="text-gray-600">{item.contact_number}</Text>
                                </View>
                            </View>

                            <Text className="text-gray-700 mb-1">
                                <Text className="font-semibold">Address: </Text>
                                {item.street}
                            </Text>
                            <Text className="text-gray-700 mb-1">
                                <Text className="font-semibold">Shipping Fee: </Text>
                                {item.location.shipping_fee}
                            </Text>
                            <Text
                                className={`font-semibold mb-2 ${item.is_verified ? 'text-green-600' : 'text-yellow-600'
                                    }`}
                            >
                                Status: {item.is_verified ? 'Approved' : 'Pending'}
                            </Text>

                            <View className="flex-row flex-wrap gap-2">
                                <TouchableOpacity
                                    className="bg-blue-500 px-4 py-1 rounded-xl"
                                    onPress={() => handleEdit(item)}
                                >
                                    <Text className="text-white">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-red-500 px-4 py-1 rounded-xl" onPress={() => handleDelete(item.id)}>
                                    <Text className="text-white">Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-blue-500 px-4 py-1 rounded-xl"
                                    onPress={() => handleClickProduct(item.id)}
                                >
                                    <Text className="text-white">View Products</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-blue-500 px-4 py-1 rounded-xl" onPress={() => handleClickRider(item.id)}>
                                    <Text className="text-white">View Riders</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                onPress={handleCreate}
                className="absolute bottom-5 right-5 bg-green-600 px-5 py-3 rounded-full shadow"
            >
                <Text className="text-white font-semibold">+ Create New Store</Text>
            </TouchableOpacity>
        </View>
    );
}
