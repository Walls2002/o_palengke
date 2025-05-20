import API from "@/api/apiService";
import { store } from "expo-router/build/global-state/router-store";

export const cartApi = {
  async addItemToCart(productId: number | string, payload: any, user: any) {
    if (!user) {
      return;
    }
    try {
      const response = await API.post(`/cart/${productId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error storing to cart:", error);
    }
  },

  async fetchCart(user: any) {
    if (!user) {
      return;
    }
    try {
      const response = await API.get("/cart");
      return response.data;
    } catch (error) {
      console.error("Error fetching cart fetchCart:", error);
    }
  },

  async previewItem(storeId: number, payload: any) {
    try {
      const response = await API.post(
        `cart/checkout-preview/${storeId}`,
        payload
      );
      return response.data.order;
    } catch (error) {}
  },

  async storeOrder(storeId: number, payload: any) {
    try {
      const response = await API.post(`/cart/checkout/${storeId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error storing order:", error);
    }
  },

  async decreaseItemQuantity(
    productId: number | string,
    clear: boolean = false
  ) {
    try {
      const url = clear
        ? `/cart/${productId}?clear=1`
        : `/cart/${productId}?clear=0`;
      const response = await API.put(url);
      return response.data;
    } catch (error) {
      console.error("Error decreasing cart item quantity:", error);
    }
  },

  // Increase quantity of an existing cart item
  async increaseItemQuantity(
    productId: number | string,
    kiloMeasurement: number | null = null
  ) {
    try {
      const payload = kiloMeasurement
        ? { kilo_measurement: kiloMeasurement }
        : { quantity: 1 };

      const response = await API.post(`/cart/${productId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error increasing item quantity:", error);
    }
  },
  async clearCart() {
    try {
      const response = await API.delete("/cart");
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  },
};
