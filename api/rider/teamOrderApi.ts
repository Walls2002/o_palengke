import API from "@/api/apiService";

export const teamOrderApi = {
  async fetchTeamOrders() {
    try {
      const response = await API.get("/rider-orders/team");
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching team order:", error);
    }
  },

  async acceptTeamOrders(orderId: number) {
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
