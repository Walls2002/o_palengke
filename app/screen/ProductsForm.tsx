import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { data } from '@/api/vendor/productsApi';
import { Link, router } from 'expo-router';
import { Location } from '@/types/Location';
import { Category } from '@/types/Product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';


const measurements = ['kilo', 'piece'];


export default function ProductsForm() {
  const route = useRoute<RouteProp<{ params: ProductsFormParams}, 'params'>>();
  const { product, store_id } = route.params || {};
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const parseProduct = product ? JSON.parse(product) : null;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    image: '',
    measurement: '',
    price: '',
    quantity: '',
    category: '',
    name: '',
    category_id: null,
    store_id: null,
  });

  useEffect(() => {
    if (parseProduct) {
      setFormData({
        store_name: parseProduct.store.store_name,
        image: parseProduct.image,
        measurement: parseProduct.measurement,
        price: parseProduct.price,
        quantity: parseProduct.quantity,
        category: parseProduct.category.name,
        name: parseProduct.name,
        category_id: parseProduct.category.id || null,
        store_id: parseProduct.store.id || null,

      });
    }

  }, []);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await data.productCategories();
    setCategoriesList(response.categories);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {

      Toast.show({
        type: "error",
        position: "top",
        text1: "Camera roll permissions are required.",
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

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData({ ...formData, image: uri }); 
    }
  };
  const handleSave = async () => {
    if (
      !formData.measurement.trim() ||
      !formData.price.trim() ||
      !formData.quantity.trim() ||
      !formData.name.trim() ||
      !formData.category.trim()
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
      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('quantity', formData.quantity);
      form.append('measurement', formData.measurement);
      form.append('category', formData.category);
      form.append('store_id', formData.store_id);
      form.append('category_id', formData.category_id);


      if (formData.id) {
        form.append('id', formData.id);
      }

      if (formData.image && !formData.image.startsWith('products')) {
        const uriParts = formData.image.split('.');
        const fileType = uriParts[uriParts.length - 1];

        form.append('image', {
          uri: formData.image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      if (parseProduct) {
        await data.productUpdate(parseProduct.id, form);
        Toast.show({
          type: "success",
          position: "top",
          text1: "Product updated successfully!",
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
        router.push({
          pathname: '/screen/vendor/products/[id]',
          params: { id: parseProduct.store.id },
        });
      } else {
        await data.productCreate(form);
        Toast.show({
          type: "success",
          position: "top",
          text1: "Product created successfully!",
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
        router.push({
          pathname: '/screen/vendor/products/[id]',
          params: { id: store_id },
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex-1 bg-white p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            {product ? 'Edit Product' : 'Create Product'}
          </Text>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter product name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </View>


          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Image</Text>
            {formData.image ? (
              <Image
                source={{
                  uri: formData.image.startsWith('products')
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

          {/* Measurement */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Measurement <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.measurement}
                onValueChange={(value) => setFormData({ ...formData, measurement: value })}
              >
                <Picker.Item label="Select a measurement" value={''} />
                {measurements.map((measurement, index) => (
                  <Picker.Item key={index} label={measurement} value={measurement} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Price <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="Enter price"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </View>

          {/* Quantity */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">
              Quantity <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholder="Enter quantity"
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </View>

          {/* Category */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-1">
              Category <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => {
                  const selectedCategory = categoriesList.find(catg => catg.name === value);
                  setFormData({
                    ...formData,
                    category: value,
                    category_id: selectedCategory?.id || null,
                    store_id: store_id
                  });
                }}
              >
                <Picker.Item label="Select a category" value={null} />
                {categoriesList.map((catg, index) => (
                  <Picker.Item key={index} label={catg.name} value={catg.name} />
                ))}
              </Picker>
            </View>
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
