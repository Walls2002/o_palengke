import API from "@/api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const userApi = {
  async updateBasicInformation(payload: any) {
    try {
      const response = await API.put("/profile/update", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateCredentials(payload: any) {
    try {
      const response = await API.put("/profile/change-password", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserProfile() {
    try {
      const response = await API.get("/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  async checkUserProfile() {
    try {
      const response = await API.get("/me");
      if (response.data.user) {
        // Store the location ID for potential use in product filtering
        if (response.data.user.location_id) {
          await AsyncStorage.setItem(
            "user_location_id",
            response.data.user.location_id.toString()
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  },

  async updateProfilePicture(imageUri: string): Promise<any> {
    try {
      // Create form data
      const formData = new FormData();
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];

      // Append the file to form data with the key 'image' - this must match Laravel's input name
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: "image/jpeg",
      } as any);

      // Make the API request
      const response = await API.post(
        "/profile/change-profile-picture",
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => data,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      // More detailed error logging
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (axios.isAxiosError(error) && error.request) {
        console.error("No response received:", error.request);
      }
      throw error;
    }
  },

  async getLocation() {
    try {
      const response = await API.get("/locations");
      return response;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  },
};
