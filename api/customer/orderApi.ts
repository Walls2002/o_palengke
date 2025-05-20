import API from "@/api/apiService";
export const orderApi = {
  async fetchPendingOrders(user: { type: string } | null) {
    if (!user) {
      console.warn("No user found. Skipping fetchPendingOrders API call.");
      return null;
    }
    try {
      const response = await API.get("/customer-orders?show_pending=1");
      return response.data;
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  },

  async fetchConfirmedOrders(user: { type: string } | null) {
    if (!user) {
      console.warn("No user found. Skipping fetchPendingOrders API call."); 
      return null;
    }
    try {
      const response = await API.get(
        "/customer-orders?show_confirmed=1&show_assigned=1&show_dispatched=1"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching confirmed orders", error);
    }
  },
  async fetchDeliveredOrders(user: { type: string } | null) {
    if (!user) {
      console.warn("No user found. Skipping fetchPendingOrders API call.");
      return null;
    }
    try {
      const response = await API.get("/customer-orders?show_delivered=1");
      return response.data;
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
    }
  },
  
  async fetchCancelledOrders(user: { type: string } | null) {
    if (!user) {
      console.warn("No user found. Skipping fetchPendingOrders API call.");
      return null;
    }
    try {
      const response = await API.get("customer-orders?show_canceled=1");
      return response.data;
    } catch (error) {
      console.error("Error fetching cancelled orders:", error);
    }
  },
};
