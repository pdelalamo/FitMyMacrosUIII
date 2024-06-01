import axios, { AxiosInstance } from 'axios';

class FitMyMacrosApiService {

    private client: AxiosInstance;

    //TODO: change dev for prod once this is in production
    constructor() {
        this.client = axios.create({
            baseURL: 'https://8glhn3t6cf.execute-api.eu-west-3.amazonaws.com/dev'
        });
    }

    setAuthToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = token;
    }

    public async getRecipes(params: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.get('/recipes', { params });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch recipes');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    }

    public async getRecipeDetail(params: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.get('/recipes/detail', { params });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch recipe detail');
            }
        } catch (error) {
            console.error('Error fetching recipe detail:', error);
            throw error;
        }
    }

    public async updateUserData(data: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.post('/userData', data);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to post user data');
            }
        } catch (error) {
            console.error('Error posting user data:', error);
            throw error;
        }
    }

    public async updateRecipes(data: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.put('/recipes', data);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to update recipe');
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            throw error;
        }
    }

}

export default new FitMyMacrosApiService();
