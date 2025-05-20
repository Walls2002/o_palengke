import API from "@/api/apiService";

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
};
