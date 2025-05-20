import React from "react";
import { Text, View, FlatList, Image, TouchableOpacity } from "react-native";
import { Product } from "@/types/Product";

const ProductItem = React.memo(
  ({ product, onPress }: { product: Product; onPress: () => void }) => {
 
    return (
      <View
        key={product.id}
        className="bg-card rounded-lg shadow-sm flex flex-row gap-x-3 p-2 mt-2"
      >
        <View>
          <Image
            source={
              product.image
                ? { uri: product.image }
                : require("../../assets/images/no-image.jpg")
            }
            className="h-48 w-48 mb-6"
          />
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-lg font-semibold"
          >
            {product.name}
          </Text>
          <Text className="text-lg font-medium">${product.price}</Text>
          <Text className="text-lg font-medium">
            Stocks: {product.quantity} {product.measurement}
          </Text>
          <Text className="text-sm font-regular">Store: test</Text>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-sm font-regular"
          >
            {product.store?.location?.barangay},{" "}
            {product.store?.location?.province}, {product.store?.location?.city}
          </Text>
          <Text className="text-sm font-regular">
            Contact: {product.store?.contact_number}
          </Text>

          <TouchableOpacity onPress={onPress} className="px-2">
            <View className="bg-primary mt-4 w-40 h-12 flex justify-center items-center rounded-md">
              <Text className="text-center text-lg font-semibold text-textSecondary">
                View Product
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

export default ProductItem;
