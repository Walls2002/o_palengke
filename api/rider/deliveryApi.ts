import API from "@/api/apiService";

export const deliveryApi = {
  async fetchOrderForDelivery(userRole: string | null) {
    if (userRole !== "rider") {
      return null;
    }
    try {
      const response = await API.get("/rider-orders");
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching delivery", error);
    }
  },
  async uploadProofOfDelivery(orderId: number, formData: FormData) {
    try {
      const response = await API.post(`/rider-orders/${orderId}/deliver`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("Error uploading proof of delivery", error);
      throw error;
    }
  }
};
