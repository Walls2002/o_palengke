import API from "@/api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const productApi = {
  async fetchProducts(
    categoryId?: string,
    locationId?: string,
    usePublicAPI: boolean = false
  ) {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      let endpoint = "/public-catalog";
      const params = new URLSearchParams();

      if (categoryId) {
        params.append("category_id", categoryId);
      }

      if (locationId) {
        params.append("location_id", locationId);
      }

      // Combine endpoint with query parameters
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const response = await API.get(endpoint);

      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Method for when you specifically need the authenticated endpoint
  async fetchAuthenticatedProducts(categoryId?: string, locationId?: string) {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No authentication token available");
      }

      let endpoint = "/catalog";

      // Build query parameters
      const params = new URLSearchParams();
      if (categoryId) params.append("category_id", categoryId);
      if (locationId) params.append("location_id", locationId);

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const response = await API.get(endpoint);
      return response;
    } catch (error) {
      console.error("Error fetching authenticated products:", error);
      throw error;
    }
  },

  async fetchProductById(productId: string) {
    try {
      const response = await API.get(`catalog/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async fetchProductByCategory(categoryId: string) {
    return this.fetchProducts(categoryId);
  },

  async fetchPublicProducts(categoryId?: string) {
    return this.fetchProducts(categoryId, undefined, true);
  },
};
