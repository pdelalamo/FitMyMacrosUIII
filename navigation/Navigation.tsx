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
import RecipeDetails from 'screens/features/RecipeDetails';

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
                    <Stack.Screen name="RecipeDetails" component={RecipeDetails} />
                </Stack.Navigator>
            </NavigationContainer>
        </UserPreferencesProvider>
    );
};

export default Navigation;
