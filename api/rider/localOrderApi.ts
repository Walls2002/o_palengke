import API from "@/api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const localOrderApi = {
  async fetchLocalOrders() {
    try {
      const response = await API.get("/rider-orders/local");
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching team order:", error);
    }
  },

  async acceptLocalOrders(orderId: number) {
    try {
      const response = await API.post(`/rider-orders/${orderId}/take`);
      return response.data.order;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  },
  async cancelLocalOrder(orderId: number) {
    try {
      const access_token = await AsyncStorage.getItem("auth_token");
      const response = await API.post(
        `/rider-orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  },
};
