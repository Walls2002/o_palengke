import API from "../apiService";

export const data = {
    productShow: async (storeId: number) => {
        try {
            const response = await API.get('/products', {
                params : {
                  store_id: storeId
                }
            });

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },
    
    productCreate: async (formData: any) => {
       try {
        const response = await API.post('/products', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
              },
        });
        return response?.data;
       } catch (error) {
        console.log("error", error);
       }
    },

    productUpdate: async (storeId: number, formData: any) => {
        try {
          formData.append('_method', 'PUT'); // method spoofing for Laravel
      
          const response = await API.post(`/products/${storeId}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response?.data;
        } catch (error) {
          console.log("error", error);
        }
      },
      

     
     productCategories: async () => {
        try {
            const response = await API.get('/categories');
            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
     },
     
     productDelete: async(productId: number) => {
        try {
            const response = await API.delete(`/products/${productId}`);
            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
     }
};