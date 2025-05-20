import API from "@/api/apiService";

export const voucherApi = {
  async fetchVouchers(user: { type: string } | null) {
    if (!user) {
      console.warn("No user found. Skipping fetchVouchers API call.");
      return null;
    }
    try {
      const response = await API.get("/my-vouchers");
      return response.data;
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      throw error;
    }
  },
};
