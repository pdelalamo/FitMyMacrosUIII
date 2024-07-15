import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import RecipeFeature from '../screens/productFeatures/RecipeFeature';
import GoalsFeature from '../screens/productFeatures/GoalsFeature';
import RestaurantFeature from '../screens/productFeatures/RestaurantFeature';
import AiFeature from '../screens/productFeatures/AiFeature';
import ChooseDiet from '../screens/initialQuestions/ChooseDiet';
import { UserPreferencesProvider } from '../context/UserPreferencesContext';
import AvailableIngredients from '../screens/initialQuestions/AvailableIngredients';
import Equipment from '../screens/initialQuestions/Equipment';
import Allergies from '../screens/initialQuestions/Allergies';
import MeasurementPreferences from '../screens/initialQuestions/MeasurementPreferences';
import FreeTrialScreen from '../screens/FreeTrialScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';
import SignInScreen from '../screens/SignInScreen';
import RecipeGeneration from 'screens/features/RecipeGeneration';
import GeneratedRecipesList from 'screens/features/GeneratedRecipesList';
import RecipeDetail from 'screens/features/RecipeDetail';
import TargetCaloriesAndMacros from 'screens/initialQuestions/TargetCaloriesAndMacros';
import SettingsScreen from 'screens/settings/SettingsScreen';
import Footer from 'utils/Footer';
import AvailableIngredientsSettings from 'screens/settings/AvailableIngredientsSettings';
import AllergiesSettings from 'screens/settings/AllergiesSettings';
import DietSettings from 'screens/settings/DietSettings';
import EquipmentSelection from '../screens/initialQuestions/Equipment';
import EquipmentSettings from 'screens/settings/EquipmentSettings';
import MeasurementSettings from 'screens/settings/MeasurementSettings';
import TargetEnergyAndMacros from 'screens/settings/TargetEnergyAndMacros';
import OpenRecipeDetail from 'screens/features/OpenRecipeDetail';
import FavoriteRecipes from 'screens/features/FavoriteRecipes';
import RestaurantForm from 'screens/features/restaurant/RestaurantForm';
import RestaurantRecommender from 'screens/features/restaurant/RestaurantRecommender';
import RestaurantRecommendationDetail from 'screens/features/restaurant/RestaurantRecommendationDetail';

const Stack = createNativeStackNavigator();

const Navigation: React.FC = () => {
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkUserStatus = async () => {
            const isUserSignedIn = await AsyncStorage.getItem('isUserSignedIn');
            if (isUserSignedIn === 'true') {
                setInitialRoute('MainScreen');
            } else {
                setInitialRoute('HomeScreen');
            }
        };

        checkUserStatus();
    }, []);

    if (initialRoute === null) {
        return null;
    }

    return (
        <UserPreferencesProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRoute}>
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="RecipeFeature" component={RecipeFeature} />
                    <Stack.Screen name="GoalsFeature" component={GoalsFeature} />
                    <Stack.Screen name="AiFeature" component={AiFeature} />
                    <Stack.Screen name="RestaurantFeature" component={RestaurantFeature} />
                    <Stack.Screen name="ChooseDiet" component={ChooseDiet} />
                    <Stack.Screen name="Allergies" component={Allergies} />
                    <Stack.Screen name="MeasurementPreferences" component={MeasurementPreferences} />
                    <Stack.Screen name="AvailableIngredients" component={AvailableIngredients} />
                    <Stack.Screen name="Equipment" component={Equipment} />
                    <Stack.Screen name="FreeTrialScreen" component={FreeTrialScreen} />
                    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                    <Stack.Screen name="MainScreen" component={MainScreen} />
                    <Stack.Screen name="SignInScreen" component={SignInScreen} />
                    <Stack.Screen name="RecipeGeneration" component={RecipeGeneration} />
                    <Stack.Screen name="GeneratedRecipesList" component={GeneratedRecipesList} />
                    <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
                    <Stack.Screen name="TargetCaloriesAndMacros" component={TargetCaloriesAndMacros} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                    <Stack.Screen name="Footer" component={Footer} />
                    <Stack.Screen name="AvailableIngredientsSettings" component={AvailableIngredientsSettings} />
                    <Stack.Screen name="AllergiesSettings" component={AllergiesSettings} />
                    <Stack.Screen name="DietSettings" component={DietSettings} />
                    <Stack.Screen name="EquipmentSettings" component={EquipmentSettings} />
                    <Stack.Screen name="MeasurementSettings" component={MeasurementSettings} />
                    <Stack.Screen name="TargetEnergyAndMacros" component={TargetEnergyAndMacros} />
                    <Stack.Screen name="OpenRecipeDetail" component={OpenRecipeDetail} />
                    <Stack.Screen name="FavoriteRecipes" component={FavoriteRecipes} />
                    <Stack.Screen name="RestaurantForm" component={RestaurantForm} />
                    <Stack.Screen name="RestaurantRecommender" component={RestaurantRecommender} />
                    <Stack.Screen name="RestaurantRecommendationDetail" component={RestaurantRecommendationDetail} />
                </Stack.Navigator>
            </NavigationContainer>
        </UserPreferencesProvider>
    );
};

export default Navigation;
