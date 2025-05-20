import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { data } from '@/api/vendor/vendorApi';
import { router } from 'expo-router';
import { Location } from '@/types/Location';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

export default function StoreForm() {
  const route = useRoute();
  const { store } = route.params || {};
  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const parsedStore = store ? JSON.parse(store) : null;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    store_name: '',
    image: '',
    street: '',
    contact_number: '',
    locations: { id: null, barangay: '', province: '', city: '' },
    id: null,
    vendor_id: null,
    location_id: null,
  });

  useEffect(() => {
    if (parsedStore) {
      setFormData({
        store_name: parsedStore.store_name,
        image: parsedStore.image,
        street: parsedStore.street,
        contact_number: parsedStore.contact_number,
        locations: parsedStore.location,
        id: parsedStore.id,
        vendor_id: parsedStore.vendor_id,
        location_id: parsedStore.location?.id || null,
      });
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const response = await data.vendorLocations();
    setLocationsList(response);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData({ ...formData, image: uri }); // or use result.assets[0].base64
    }
  };



  /*   const handleSave = async () => {
      if (
        !formData.store_name.trim() ||
        !formData.street.trim() ||
        !formData.contact_number.trim() ||
        !formData.location_id
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
  
      setIsLoading(true);
  
      try {
        if (parsedStore) {
          await data.vendorStoreUpdate(formData);
          Toast.show({
            type: "success",
            position: "top",
            text1: "Store updated successfully",
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
        } else {
          await data.vendorStoreCreate(formData);
          Toast.show({
            type: "success",
            position: "top",
            text1: "Store created successfully",
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
        }
        router.push('/(vendor)/store');
      } catch (error) {
        console.error('Error saving store:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }; */


  const handleSave = async () => {
    if (
      !formData.store_name.trim() ||
      !formData.street.trim() ||
      !formData.contact_number.trim() ||
      !formData.location_id
    ) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Please fill in all required fields.",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();

      form.append('store_name', formData.store_name);
      form.append('street', formData.street);
      form.append('contact_number', formData.contact_number);
      form.append('vendor_id', formData.vendor_id);
      form.append('location_id', formData.location_id);

      if (formData.id) {
        form.append('id', formData.id);
      }

      if (formData.image && !formData.image.startsWith('stores')) {
        const uriParts = formData.image.split('.');
        const fileType = uriParts[uriParts.length - 1];

        form.append('image', {
          uri: formData.image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      if (parsedStore) {
        await data.vendorStoreUpdate(form); // <-- pass FormData
      } else {
        await data.vendorStoreCreate(form);
      }

      Toast.show({
        type: "success",
        position: "top",
        text1: parsedStore ? "Store updated successfully" : "Store created successfully",
        visibilityTime: 3000,
      });

      router.push('/(vendor)/store');
    } catch (error) {
      console.error('Error saving store:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex-1 bg-white p-4">
          <TouchableOpacity onPress={() => router.push('/(vendor)/store')}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            {store ? 'Edit Store' : 'Create Store'}
          </Text>

          {/* Store Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Store Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.store_name}
              onChangeText={(text) => setFormData({ ...formData, store_name: text })}
              placeholder="e.g. Juan's Mart"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Image</Text>
            {formData.image ? (
              <Image
                source={{
                  uri: formData.image.startsWith('stores')
                    ? `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${formData.image}`
                    : formData.image,
                }}
                style={{ width: 100, height: 100, marginBottom: 8, borderRadius: 8 }}
              />

            ) : null}
            <TouchableOpacity
              onPress={handleImagePick}
              className="bg-gray-200 px-3 py-2 rounded-lg w-40 items-center"
            >
              <Text className="text-sm text-gray-700">Upload Image</Text>
            </TouchableOpacity>
          </View>
          {/* Street */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Street <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholder="e.g. 123 Main St."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </View>

          {/* Location Picker */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Location <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.location_id}
                onValueChange={(value) => {
                  const selectedLocation = locationsList.find(loc => loc.id === value);
                  setFormData({
                    ...formData,
                    locations: selectedLocation || {},
                    location_id: value,
                  });
                }}
              >
                <Picker.Item label="Select location" value={null} />
                {locationsList.map((location) => (
                  <Picker.Item
                    key={location.id}
                    label={`${location.barangay}, ${location.province}, ${location.city}`}
                    value={location.id}
                  />
                ))}
              </Picker>

            </View>
          </View>

          {/* Contact Number */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-1">
              Contact Number <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.contact_number}
              onChangeText={(text) => setFormData({ ...formData, contact_number: text })}
              placeholder="e.g. 09123456789"
              keyboardType="phone-pad"
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
