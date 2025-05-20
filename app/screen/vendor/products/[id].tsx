import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { data } from "@/api/vendor/productsApi";
import { Product } from '@/types/Product';
import { useRoute } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function StoreProducts() {
    const { id } = useLocalSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    const fetchProducts = async () => {
        setLoading(true);
        const response = await data.productShow(id);
        setProducts(response);
        setFilteredProducts(response);
        setLoading(false);
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
        router.push({
            pathname: '/screen/ProductsForm',
            params: { store_id: id },
        });
    };

    const handleEdit = (product: Product) => {
        router.push({
            pathname: '/screen/ProductsForm',
            params: { product: JSON.stringify(product) },
        });
    };

    const handleDelete = async (productId: number) => {
        const response = await data.productDelete(productId);
        Toast.show({
            type: "error",
            position: "top",
            text1: "Product deleted successfully",
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
        fetchProducts();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="p-4">
                <TouchableOpacity onPress={() => router.push('/(vendor)/store')}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
                />
            </View>

            {/* 🟡 Activity Indicator */}
            {loading ? (
                <View className="flex-1 justify-center items-center mt-20">
                    <ActivityIndicator size="large" color="#337037" />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 m-2 rounded-2xl shadow-md">
                            {/* Category with Image */}
                            <View className="self-start flex-row items-center px-3 py-1 rounded-full border border-green-500 mb-2">
                                <Image
                                    source={{
                                        uri: item.image
                                            ? `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${item.image}`
                                            : 'https://via.placeholder.com/40', // or your own default image URL
                                    }}
                                    className="w-6 h-6 rounded-full mr-2"
                                />

                                <Text className="text-green-700 text-xs font-semibold">
                                    {item.category.name}
                                </Text>
                            </View>

                            {/* Name & Store */}
                            <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                            <Text className="text-gray-500 text-sm mb-2">{item.store.store_name}</Text>

                            {/* Info Fields */}
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Measurement: </Text>
                                {item.measurement}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Quantity: </Text>
                                {item.quantity}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Price: </Text>
                                ₱{item.price}
                            </Text>

                            {/* Action Buttons */}
                            <View className="flex-row flex-wrap gap-2 mt-3">
                                <TouchableOpacity
                                    className="bg-gray-100 px-4 py-1 rounded-xl"
                                    onPress={() => handleEdit(item)}
                                >
                                    <Text className="text-gray-700">Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-gray-100 px-4 py-1 rounded-xl"
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Text className="text-gray-700">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    )}
                    ListEmptyComponent={
                        <Text className="text-center mt-10 text-gray-500">No products found.</Text>
                    }
                />
            )}

            <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20 }}>
                <TouchableOpacity
                    onPress={handleCreate}
                    className="bg-green-600 px-5 py-3 rounded-full shadow-lg">
                    <Text className="text-white font-semibold text-sm">+ New Product</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
