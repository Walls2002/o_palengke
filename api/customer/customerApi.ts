import API from "@/api/apiService";
export const userApi = {
  async registerCustomer(formData: FormData) {
    try {
      const response = await API.post("/customers", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    } catch (error: any) {
      throw error;
    }
  },

  async registerVendor(formData: FormData) {
    try {
      const response = await API.post("/users/vendor-register", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 15000,
      });
      return response;
    } catch (error: any) {
      console.error("Error registration for vendor:", error);
      throw error; 
    }
  },
};
