import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import SecurityApiService from './SecurityApiService';

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

    setAsyncInvocationMode(async: boolean) {
        if (async)
            this.client.defaults.headers.common['InvocationType'] = 'Event';
    }

    public async getRecipes(params: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.get('/recipes', { params });
            console.log('response status: ' + response.status);
            console.log('response data: ' + response.data);
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

    public async getRecipesFromDynamoDB(params: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.get('/recipes', { params });
            console.log('response status: ' + response.status);
            console.log('response data: ' + response.data);
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

    public async sendUserData() {
        try {
            const asyncEmail = await AsyncStorage.getItem("username");
            const email = asyncEmail === null ? '' : asyncEmail.toLowerCase()
            const savedMap = await AsyncStorage.getItem('ingredientsMap');
            const parsedObject = await JSON.parse(savedMap !== null ? savedMap : '{}');
            const savedAllergies = await AsyncStorage.getItem('allergiesList');
            const allergies = savedAllergies === null ? [] : JSON.parse(savedAllergies);
            const diet = await AsyncStorage.getItem('dietType');
            const dietType = diet === null ? '' : diet;
            const savedAEq = await AsyncStorage.getItem('equipmentList');
            const equipment = savedAEq === null ? [] : JSON.parse(savedAEq);
            const energy = await AsyncStorage.getItem('measurementEnergy');
            const weight = await AsyncStorage.getItem('measurementSolid');
            const fluid = await AsyncStorage.getItem('measurementFluid');

            const parsedMap: Map<string, string> = new Map(Object.entries(parsedObject));
            parsedMap.forEach((value: string, key: string) => {
                console.log(key, value);
            });
            const foodObject = Object.fromEntries(parsedMap);
            const userData = {
                userId: email,
                food: foodObject,
                "allergies-intolerances": allergies,
                vegan: dietType === 'Vegan',
                vegetarian: dietType === 'Vegetarian',
                dietType: dietType,
                equipment: equipment,
                weightUnit: weight,
                fluidUnit: fluid,
                energyUnit: energy
            };
            const tokenResponse = await SecurityApiService.getToken(`username=${email.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse.body;
            console.log('token: ' + token);

            this.setAuthToken(token);
            const result = await this.updateUserData(userData);
            console.log('User data updated successfully:', result);
        } catch (error) {
            console.error('Failed to update user data:', error);
        }
    }

    public async updateUserData(data: Record<string, any>): Promise<any> {
        try {
            console.log('user data:', JSON.stringify(data, null, 2)); // Pretty print with indentation
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
