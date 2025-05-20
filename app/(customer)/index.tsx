import React from "react";
import { useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { categoryApi } from "@/api/customer/categoryApi";
import { productApi } from "@/api/customer/productsApi";
import { Product } from "@/types/Product";

const ProductItem = React.memo(
  ({
    product,
    onPress,
    cardWidth,
  }: {
    product: Product;
    onPress: () => void;
    cardWidth: number;
  }) => {
    const screenWidth = Dimensions.get("window").width;
    const imageHeight = cardWidth * 0.75;

    let productImage;

    if (product.image) {
      if (product.image.startsWith("http")) {
        productImage = { uri: product.image };
      } else {
        productImage = {
          uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/storage/${product.image}`,
        };
      }
    } else {
      productImage = require("../../assets/images/no-image.jpg");
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{ width: cardWidth }}
        className="mb-4 px-[2px] mt-3"
      >
        <View className="rounded-xl bg-card h-auto p-2 shadow-sm">
          <View className="mb-2">
            <Image
              source={productImage}
              style={{
                width: "100%",
                height: imageHeight,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </View>
          <View className="px-2 pb-2">
            <Text numberOfLines={1} ellipsizeMode="tail" className="font-bold">
              {product?.name || " "}
            </Text>
            <Text className="font-regular">
              {product?.quantity || 0} {product?.measurement || "units"} left
            </Text>
            <Text className="font-medium text-base mt-1">
              ₱{product?.price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

export default function HomeScreen() {
  //States
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 24) / 2;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  //Hooks
  //Fetch categories from the API when the component mounts
  useEffect(() => {
    categoryApi
      .fetchCategories()
      .then((response) => {
        const allOption = { name: "All" };
        setCategories([{ id: 0, ...allOption }, ...response.categories]);
      })
      .catch((error) => {
        setCategories([{ id: 0, name: "All" }]);
      });
  }, []);

  // For product fetch
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      if (selectedCategory === "All") {
        const response = await productApi.fetchProducts();
        setProducts(response?.data || []);
      } else {
        // Find the category ID based on name
        const categoryObj = categories.find(
          (cat) => cat.name === selectedCategory
        );

        if (categoryObj) {
          const response = await productApi.fetchProducts(
            categoryObj.id.toString()
          );
          setProducts(response?.data || []);
        }
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, categories]);

  //Event handlers
  const handleClickItem = (product: Product) => {
    router.push({
      pathname: "/screen/ProductDetail",
      params: { product: JSON.stringify(product) },
    });
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call the fetch function
    fetchProducts();

    // Force the loading indicator to disappear after 3 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [fetchProducts]);

  // Render each product item
  const renderItem = ({ item }: { item: Product }) => (
    <ProductItem
      product={item}
      onPress={() => handleClickItem(item)}
      cardWidth={cardWidth}
    />
  );

  return (
    <SafeAreaView className="flex-1 px-3" edges={["top"]}>
      <View className="mt-2 flex-1">
        <View className="mt-4 flex-row items-center gap-4">
          {/* Logo */}
          <Image
            style={{ width: 45 }}
            source={require("../../assets/images/logo.png")}
            className="h-10 w-10 "
            resizeMode="cover"
          />

          <View className="flex-1 relative">
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowFilter((prev) => !prev)}
            >
              <TextInput
                className="h-[50px] border border-gray-300 rounded-lg pl-12 pr-4"
                placeholder="Select a category..."
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>

            {/* Search Icon */}
            <View className="absolute left-3 top-4">
              <Search size={24} color={"#BFBFBF"} />
            </View>
          </View>
        </View>
        {/* Category */}
        {showFilter && (
          <View className="mt-4 z-10">
            <FlatList
              data={categories}
              key={(4).toString()}
              keyExtractor={(item, index) => index.toString()}
              numColumns={4}
              columnWrapperStyle={{
                justifyContent: "space-around",
                marginBottom: 10,
              }}
              renderItem={({ item }) => {
                const isSelected =
                  selectedCategory && selectedCategory === item.name;
                return (
                  <TouchableOpacity
                    onPress={() => handleCategorySelect(item.name)}
                  >
                    <View
                      className={`border border-primaryLight px-[10px] py-1 ${
                        item.name === "All" ? "rounded-3xl" : "rounded-full"
                      } ${isSelected ? "bg-primaryLight" : ""}`}
                    >
                      <Text className="text-center text-lg font-medium">
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* FlatList - Products */}
        <View className="py-4 pb-20">
          <View className="mt-4">
            <Text className="text-xl font-bold">Products</Text>
          </View>

          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            data={products}
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : `product-${index}`
            }
            numColumns={2}
            contentContainerStyle={{
              paddingBottom: 150,
              flexGrow: 1,
            }}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text className="text-center text-lg font-medium mt-5">
                No products available
              </Text>
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
