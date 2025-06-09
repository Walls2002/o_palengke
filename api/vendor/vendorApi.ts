import API from "../apiService";

export const data = {
  vendorStore: async (storeId: number, params: object) => {
    try {
      const response = await API.get(`/vendor-orders/${storeId}`, {
        params,
      });

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },
  vendorShow: async (order: any) => {
    try {
      const response = await API.get(`/vendor-orders/${order}/show`);

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorConfirm: async (orderId: number) => {
    try {
      const response = await API.put(`/vendor-orders/${orderId}/confirm`);

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorDispatch: async (order: any, riderTeamOnly: string) => {
    try {
      const response = await API.post(`/vendor-orders/${order}/dispatch`, {
        rider_team_only: riderTeamOnly,
      });

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorCancel: async (orderId: number) => {
    try {
      const response = await API.delete(`/vendor-orders/${orderId}/cancel`);
      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorStoreList: async () => {
    try {
      const response = await API.get("/stores");

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorAllStores: async () => {
    try {
      const response = await API.get("/all-stores");

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorStoreUpdate: async (formData: any) => {
    try {
      const response = await API.post("/stores", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorStoreCreate: async (formData: any) => {
    try {
      const response = await API.post("/stores/self-register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorStoreDelete: async (storeId: number) => {
    try {
      const response = await API.delete(`/stores/${storeId}`);
      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  vendorLocations: async () => {
    try {
      const response = await API.get("/locations");
      return response?.data;
    } catch (error) {
      console.log("error", error);
    }
  },
};
