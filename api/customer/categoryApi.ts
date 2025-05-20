import API from '@/api/apiService';

export const categoryApi = {
    async fetchCategories() {
        try {
            const response = await API.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }
}