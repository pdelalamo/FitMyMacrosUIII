import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import SecurityApiService from './SecurityApiService';

class FitMyMacrosApiService {
    private client: AxiosInstance;
    private static BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
    private static RECIPES_ENDPOINT = '/recipes';
    private static USER_DATA_ENDPOINT = '/userData';
    private static RESTAURANTS_ENDPOINT = '/restaurants';

    constructor() {
        this.client = axios.create({
            baseURL: FitMyMacrosApiService.BASE_URL
        });
    }

    setAuthToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = token;
    }

    setAsyncInvocationMode(async: boolean) {
        this.client.defaults.headers.common['InvocationType'] = async ? 'Event' : '';
    }

    private async handleApiCall(method: string, url: string, data: any = null, params: any = null) {
        try {
            const response = await this.client.request({
                method,
                url,
                data,
                params
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch resource from ${url}`);
            }
            return response.data;
        } catch (error) {
            console.error(`Error fetching resource from ${url}:`, error);
            throw error;
        }
    }

    public async getRecipes(params: Record<string, any>): Promise<any> {
        return this.handleApiCall('get', FitMyMacrosApiService.RECIPES_ENDPOINT, null, params);
    }

    public async getRecipeDetail(params: Record<string, any>): Promise<any> {
        return this.handleApiCall('get', `${FitMyMacrosApiService.RECIPES_ENDPOINT}/detail`, null, params);
    }

    public async getRestaurantRecommendation(params: Record<string, any>): Promise<any> {
        return this.handleApiCall('get', FitMyMacrosApiService.RESTAURANTS_ENDPOINT, null, params);
    }

    public async getRestaurantRecommendationPDF(params: Record<string, any>): Promise<any> {
        console.log('Entering getRestaurantRecommendationPDF');
        return this.handleApiCall('post', `${FitMyMacrosApiService.RESTAURANTS_ENDPOINT}/pdf`, params);
    }

    public async updateRecipes(data: Record<string, any>): Promise<any> {
        return this.handleApiCall('put', FitMyMacrosApiService.RECIPES_ENDPOINT, data);
    }

    public async getUserData(params: Record<string, any>): Promise<any> {
        console.log('Received params:', params);
        return this.handleApiCall('get', FitMyMacrosApiService.USER_DATA_ENDPOINT, null, params);
    }

    public async updateUserData(data: Record<string, any>): Promise<any> {
        return this.handleApiCall('post', FitMyMacrosApiService.USER_DATA_ENDPOINT, data);
    }

    private async getStoredDataItem(key: string): Promise<any> {
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    public async sendUserData() {
        try {
            const email = await this.getStoredDataItem('username') || '';
            const parsedObject = await this.getStoredDataItem('ingredientsMap') || {};
            const allergies = await this.getStoredDataItem('allergiesList') || [];
            const dietType = await this.getStoredDataItem('dietType') || '';
            const equipment = await this.getStoredDataItem('equipmentList') || [];
            const energy = await AsyncStorage.getItem('measurementEnergy');
            const weight = await AsyncStorage.getItem('measurementSolid');
            const fluid = await AsyncStorage.getItem('measurementFluid');
            const favoriteMeals = await this.getStoredDataItem('favoriteMeals') || [];
            const savedPrevRecipes = await this.getStoredDataItem('previous_recipes') || [];
            const targetEnergy = await AsyncStorage.getItem('targetCalories');
            const targetProteinPercentage = await AsyncStorage.getItem('proteinPercentage');
            const targetCarbsPercentage = await AsyncStorage.getItem('carbsPercentage');
            const targetFatPercentage = await AsyncStorage.getItem('fatPercentage');
            const monthlyGenerations = await AsyncStorage.getItem('monthlyGenerations');
            const tokenGenerationDate = await AsyncStorage.getItem('tokenGenerationDate');

            const foodObject = parsedObject;
            const userData = {
                userId: email.toLowerCase(),
                food: foodObject,
                "allergies-intolerances": allergies,
                vegan: dietType === 'Vegan',
                vegetarian: dietType === 'Vegetarian',
                dietType: dietType,
                equipment: equipment,
                weightUnit: weight,
                fluidUnit: fluid,
                energyUnit: energy,
                favoriteMeals: favoriteMeals.filter((meal: any) => meal !== null),
                targetEnergy: targetEnergy,
                targetProteinPercentage: targetProteinPercentage,
                targetCarbsPercentage: targetCarbsPercentage,
                targetFatPercentage: targetFatPercentage,
                previous_recipes: savedPrevRecipes.filter((recipe: any) => recipe !== null),
                monthlyGenerations: monthlyGenerations,
                tokenGenerationDate: tokenGenerationDate
            };

            const tokenResponse = await SecurityApiService.getToken(`username=${email.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse?.body;
            console.log('Token:', token);

            if (token) {
                this.setAuthToken(token);
                const result = await this.updateUserData(userData);
                console.log('User data updated successfully:', result);
            } else {
                console.error('Failed to retrieve token');
            }
        } catch (error) {
            console.error('Failed to update user data:', error);
        }
    }
}

export default new FitMyMacrosApiService();
