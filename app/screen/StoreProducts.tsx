import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { data } from "@/api/vendor/productsApi";
import { Product } from '@/types/Product';
import { useRoute } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';

export default function StoreProducts() {
    const route = useRoute();
    /*     const { store_id } = route.params as { store_id: number }; */
    const { id } = useLocalSearchParams()
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
      /*   const response = await data.productShow(id);
        setProducts(response);
        setFilteredProducts(response); */
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = products.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.category.name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);



    const handleCreate = () => {
        router.push('/screen/ProductsForm'); // no store_id means "create"
    };

    const handleEdit = (product: Product) => {
        router.push({
            pathname: '/screen/ProductsForm',
            params: { product: JSON.stringify(product) },
        });
    };

    const handleDelete = async (storeId: number) => {
        const response = await data.vendorStoreDelete(storeId);
        fetchProducts();
    };
    return (
        <>
            <View className="p-4">
                <TouchableOpacity
                    className="bg-gray-200 px-4 py-2 rounded-lg mb-4"
                    onPress={() => router.push('/vendor/store')}
                >
                    <Text className="text-black">← Back</Text>
                </TouchableOpacity>

                {/* 🔍 Search Input */}
                <TextInput
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
                />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="bg-white p-4 m-2 rounded-2xl shadow">
                        <View className="flex-row items-center mb-2">
                            <View>
                                <Text className="text-lg font-semibold">{item.store.store_name}</Text>
                                <Text className="text-gray-600">{item.name}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-700 mb-1">
                            <Text className="font-semibold">Measurement: </Text>
                            {item.measurement}
                        </Text>
                        <Text className="text-gray-700 mb-1">
                            <Text className="font-semibold">Quantity: </Text>
                            {item.quantity}
                        </Text>
                        <Text className="text-gray-700 mb-1">
                            <Text className="font-semibold">Category: </Text>
                            {item.category.name}
                        </Text>
                        <Text className="text-gray-700 mb-1">
                            <Text className="font-semibold">Price: </Text>
                            {item.price}
                        </Text>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity className="bg-blue-500 px-4 py-1 rounded-xl" onPress={() => handleEdit(item)}>
                                <Text className="text-white">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-red-500 px-4 py-1 rounded-xl">
                                <Text className="text-white">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center mt-10 text-gray-500">No products found.</Text>}
            />
            <TouchableOpacity
                onPress={handleCreate}
                className="absolute bottom-5 right-5 bg-green-600 px-5 py-3 rounded-full shadow"
            >
                <Text className="text-white font-semibold">+ Create New Products</Text>
            </TouchableOpacity>
        </>
    );
}
