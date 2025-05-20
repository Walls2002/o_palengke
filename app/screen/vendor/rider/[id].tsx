import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { data } from "@/api/vendor/riderApi";
import { router, useLocalSearchParams } from 'expo-router';
import { Rider } from '@/types/Rider';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function StoreRiders() {
    const [ridersList, setRidersList] = useState<Rider[]>([]);
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [email, setEmail] = useState('');

    const fetchRiders = async () => {
        setLoading(true); // Start loading
        const responseData = await data.riderTeamShow(id);
        setRidersList(responseData.store_riders);
        setFilteredRiders(responseData.store_riders);
        setLoading(false); // End loading
    };

    useEffect(() => {
        fetchRiders();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = ridersList.filter((item) =>
            item.rider.user.first_name.toLowerCase().includes(query) ||
            item.rider.user.email.toLowerCase().includes(query) ||
            item.rider.plate_number.toLowerCase().includes(query)
        );
        setFilteredRiders(filtered);
    }, [searchQuery, ridersList]);

    const handleCreate = () => {
        router.push({
            pathname: '/screen/RiderForm',
            params: { store_id: id },
        });
    };

    const handleDelete = async (riderId: number) => {
        const response = await data.riderDelete(riderId);
        Toast.show({
            type: "error",
            position: "top",
            text1: "Rider deleted successfully",
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
        fetchRiders();
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };
    const addExistingRider = async () => {
        try {
            const response = await data.existingRider(id, email);

            Toast.show({
                type: "success",
                position: "top",
                text1: "Rider added successfully",
                visibilityTime: 3000,
            });

            setIsModalVisible(false);
            fetchRiders();
        } catch (error: any) {
            console.log("error", error);

            const message =
                error?.response?.data?.message || "Something went wrong. Please try again.";

            Toast.show({
                type: "error",
                position: "top",
                text1: message,
                visibilityTime: 3000,
            });
            setIsModalVisible(false);
        }
    };



    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="p-4">
                <TouchableOpacity onPress={() => router.push('/(vendor)/store')}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                {/* 🔍 Search Input */}
                <TextInput
                    placeholder="Search riders..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                />
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#337037" />
                </View>
            ) : (
                <FlatList
                    data={filteredRiders || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 m-2 rounded-2xl shadow-md">
                            {/* Name Header */}
                            <Text className="text-lg font-semibold text-gray-800 mb-1">
                                {item.rider.user.first_name} {item.rider.user.middle_name} {item.rider.user.last_name}
                            </Text>

                            {/* Rider Details */}
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Email: </Text>
                                {item.rider.user.email}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Contact No.: </Text>
                                {item.rider.user.contact}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Plate No.: </Text>
                                {item.rider.plate_number}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">License No.: </Text>
                                {item.rider.license_number}
                            </Text>
                            <Text className="text-sm text-gray-700 mb-1">
                                <Text className="font-semibold">Rating: </Text>
                                {item.rider.rating}
                            </Text>

                            {/* Status */}
                            <Text
                                className={`text-sm font-semibold mb-2 ${item.rider.user.email_verified_at ? 'text-green-700' : 'text-yellow-600'
                                    }`}
                            >
                                Status: {item.rider.user.email_verified_at ? 'Approved' : 'Pending'}
                            </Text>

                            {/* Buttons */}
                            <View className="flex-row flex-wrap gap-2 mt-3">
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
                        <Text className="text-center mt-10 text-gray-500">No riders found.</Text>
                    }
                />
            )}

            <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20 }}>

                <TouchableOpacity
                    onPress={handleCreate}
                    className="bg-green-600 px-5 py-3 rounded-full shadow-lg"
                >
                    <Text className="text-white font-semibold">+ New Rider</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleOpenModal}
                    className="bg-green-600 px-5 py-3 rounded-full shadow-lg mt-2"
                >
                    <Text className="text-white font-semibold">+ Existing Rider</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-70 px-6">
                    <View className="bg-white w-full rounded-xl p-6">
                        <Text className="text-lg font-bold mb-4 text-gray-800">Add Existing Rider</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            placeholder="Enter Rider's Email"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
                        />
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                className="mr-3"
                            >
                                <Text className="text-gray-600">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={addExistingRider}
                                className="bg-green-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
