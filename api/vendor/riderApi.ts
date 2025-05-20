import API from "../apiService";

export const data = {
    riderShow: async (storeId: number, params: object) => {
        try {
            const response = await API.get(`/vendor-orders/${storeId}`, {
                params
            })

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    riderTeamShow: async (storeId: number) => {
        try {
            const response = await API.get(`store-riders/${storeId}/team`);
            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    riderRegister: async (storeId: number, formData: any) => { 
        try {
            const response = await API.post(`store-riders/${storeId}/register`, formData);
            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    existingRider: async (storeId: number, email: string) => {
        try {
            const response = await API.post(`store-riders/${storeId}`, {
                user_email: email
            });
            return response;
        } catch (error) {
            console.log("existingRider error", error);
            throw error; // 🔥 rethrow so addExistingRider's catch can handle it
        }
    },
    

    riderDelete: async (riderId: number) => {
        try {
            const response = await API.delete(`store-riders/${riderId}`);
            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },



};