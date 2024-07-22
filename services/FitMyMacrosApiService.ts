import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import SecurityApiService from './SecurityApiService';
import Meal from 'model/Meal';

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
            const savedFavoriteMeals = await AsyncStorage.getItem('favoriteMeals');
            const favoriteMeals = savedFavoriteMeals === null ? [] : JSON.parse(savedFavoriteMeals);
            //const favoriteMealsAsString = favoriteMeals.map((meal: Meal) => JSON.stringify(meal));
            const favoriteMealsAsString = favoriteMeals.filter((recipe: any) => recipe !== null);
            const savedPrevRecipes = await AsyncStorage.getItem('previous_recipes');
            console.log('Saved previous recipes:', savedPrevRecipes);

            let previous_recipes = savedPrevRecipes === null ? [] : JSON.parse(savedPrevRecipes);
            console.log('Parsed previous recipes:', previous_recipes);

            previous_recipes = previous_recipes.filter((recipe: any) => recipe !== null);
            console.log('Filtered previous recipes (removed nulls):', previous_recipes);

            const targetEnergy = await AsyncStorage.getItem('targetCalories');
            const targetProteinPercentage = await AsyncStorage.getItem('proteinPercentage');
            const targetCarbsPercentage = await AsyncStorage.getItem('carbsPercentage');
            const targetFatPercentage = await AsyncStorage.getItem('fatPercentage');

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
                energyUnit: energy,
                favoriteMeals: favoriteMealsAsString,
                targetEnergy: targetEnergy,
                targetProteinPercentage: targetProteinPercentage,
                targetCarbsPercentage: targetCarbsPercentage,
                targetFatPercentage: targetFatPercentage,
                previous_recipes: previous_recipes
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

    public async getUserData(params: Record<string, any>): Promise<any> {
        try {
            console.log('Received params:', params);

            // Check if params is an object and iterate over it
            if (typeof params === 'object' && params !== null) {
                console.log('Params is a valid object');
                for (const key in params) {
                    if (params.hasOwnProperty(key)) {
                        console.log(`Key: ${key}, Value: ${params[key]}`);
                    }
                }
            } else {
                console.log('Params is not an object or is null');
            }
            const response = await this.client.get('/userData', { params });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to get user data');
            }
        } catch (error) {
            console.error('Error getting user data:', error);
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

    public async getRestaurantRecommendation(params: Record<string, any>): Promise<any> {
        try {
            const response = await this.client.get('/restaurants', { params });
            console.log('response status: ' + response.status);
            console.log('response data: ' + response.data);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch restaurant recommendation');
            }
        } catch (error) {
            console.error('Error fetching recommendation:', error);
            throw error;
        }
    }

    public async getRestaurantRecommendationPDF(params: Record<string, any>): Promise<any> {
        try {
            console.log('entering get pdf recommendation');
            const response = await this.client.post('/restaurants/pdf', params);
            console.log('response status: ' + response.status);
            // Convert the response data to a JSON string for readable logging
            console.log('response data: ' + JSON.stringify(response.data, null, 2));
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch restaurant recommendation');
            }
        } catch (error) {
            console.error('Error fetching recommendation:', error);
            throw error;
        }
    }

}

export default new FitMyMacrosApiService();
