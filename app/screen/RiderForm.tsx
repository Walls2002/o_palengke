import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { data } from '@/api/vendor/riderApi';
import { Category } from '@/types/Product';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';


export default function RiderForm() {
    const route = useRoute();
    const { store_id } = route.params || {};

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact: '',
        license_number: '',
        plate_number: '',
        password: 'password',
    });

    const handleSave = async () => {
        if (
            !formData.first_name.trim() ||
            !formData.middle_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim() ||
            !formData.contact.trim() ||
            !formData.license_number.trim() ||
            !formData.plate_number.trim()
        ) {
            Toast.show({
                type: "error",
                position: "top",
                text1: "Please fill in all required fields.",
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
            return;
        }
        try {
            const response = await data.riderRegister(store_id, formData);
            router.push({
                pathname: '/screen/vendor/rider/[id]',
                params: { id: store_id },
            })
             Toast.show({
                    type: "success",
                    position: "top",
                    text1: "Rider created successfully",
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
        } catch (error) {
            alert(error);
        }
    };

    return (
       <SafeAreaView>
         <ScrollView className="bg-white">
            <View className="flex-1 p-4">
            <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Create New Rider</Text>


                {/* First Name */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">
                        First Name <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.first_name}
                        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                        placeholder="Enter first name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Middle Name */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">Middle Name</Text>
                    <TextInput
                        value={formData.middle_name}
                        onChangeText={(text) => setFormData({ ...formData, middle_name: text })}
                        placeholder="Enter middle name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Last Name */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">
                        Last Name <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.last_name}
                        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                        placeholder="Enter last name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">
                        Email <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="Enter email"
                        keyboardType="email-address"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Contact */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">
                        Contact <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.contact}
                        onChangeText={(text) => setFormData({ ...formData, contact: text })}
                        placeholder="Enter contact"
                        keyboardType="phone-pad"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* License Number */}
                <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">
                        License Number <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.license_number}
                        onChangeText={(text) => setFormData({ ...formData, license_number: text })}
                        placeholder="Enter license number"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Plate Number */}
                <View className="mb-6">
                    <Text className="text-sm text-gray-600 mb-1">
                        Plate Number <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={formData.plate_number}
                        onChangeText={(text) => setFormData({ ...formData, plate_number: text })}
                        placeholder="Enter plate number"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    className={`bg-[#337037] py-3 rounded-xl items-center ${isLoading ? 'opacity-60' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-sm font-medium">Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
       </SafeAreaView>

    );
}
