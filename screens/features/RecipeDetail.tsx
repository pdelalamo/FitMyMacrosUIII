import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import { t } from 'i18next';
import Meal from 'model/Meal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityApiService from 'services/SecurityApiService';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { normalizeUnit } from 'utils/UtilFunctions';
import { featuresStyles } from './featuresStyles';

interface Props {
    navigation: any;
    route: any;
}

const RecipeDetail: React.FC<Props> = ({ route, navigation }) => {
    const [loading, setLoading] = useState(false);
    const { recipeData, anyIngredientsMode } = route.params;
    const [username, setUsername] = useState<string | null>(null);
    const [energyUnit, setEnergy] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const loadUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                setUsername(storedUsername);
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setEnergy(energy === null ? '' : energy);
            } catch (error) {
                console.error('Error loading username', error);
            }
        };

        const checkIfFavorite = async () => {
            try {
                const favorites = await AsyncStorage.getItem('favoriteMeals');
                if (favorites) {
                    const favoritesArray = JSON.parse(favorites);
                    const isFavoriteMeal = favoritesArray.some((meal: any) => meal?.name === JSON.parse(recipeData).recipeName);
                    setIsFavorite(isFavoriteMeal);
                    console.log('Setting isFavorite to:', isFavoriteMeal);
                }
            } catch (error) {
                console.error('Error loading favorite meals', error);
            }
        };

        loadUsername();
        checkIfFavorite();
    }, [recipeData]);

    // Debugging: Log the isFavorite state
    useEffect(() => {
        console.log('isFavorite state:', isFavorite);
    }, [isFavorite]);

    // Debugging: Log the incoming recipeData
    console.log('Received recipeData:', recipeData);

    // Parse the JSON safely
    let parsedData;
    try {
        parsedData = JSON.parse(recipeData);
    } catch (error) {
        console.error('Failed to parse recipeData:', error);
        return (
            <View style={globalStyles.containerMainGeneration}>
                <Text>{t('errorLoadingRecipes')}</Text>
            </View>
        );
    }

    const {
        recipeName,
        cookingTime,
        caloriesAndMacros,
        ingredientsAndQuantities,
        cookingProcess
    } = parsedData;

    const ingredients: [string, string][] = Object.entries(ingredientsAndQuantities).map(
        ([key, value]) => [key, value as string]
    );

    const handleFavoriteToggle = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favoriteMeals');
            let favoritesArray = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favoritesArray = favoritesArray.filter((meal: any) => meal?.name !== JSON.parse(recipeData).recipeName);
                setLoading(true);
                await AsyncStorage.setItem('favoriteMeals', JSON.stringify(favoritesArray));
                await FitMyMacrosApiService.sendUserData();
                setLoading(false);
                Toast.show({
                    type: 'success',
                    text1: t('removedRecipe'),
                });
            } else {
                favoritesArray.push(recipeData);
                setLoading(true);
                await AsyncStorage.setItem('favoriteMeals', JSON.stringify(favoritesArray));
                await FitMyMacrosApiService.sendUserData();
                setLoading(false);
                Toast.show({
                    type: 'success',
                    text1: t('addedRecipe'),
                });
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error updating favorite meals', error);
        }
    };

    const renderIngredient = ({ item }: { item: [string, string] }) => (
        <View style={featuresStyles.ingredientContainer}>
            <Text style={featuresStyles.ingredientName}>{item[0]}</Text>
            <Text style={featuresStyles.ingredientQuantity}>{item[1]}</Text>
        </View>
    );

    const renderStep = ({ item }: { item: string }) => (
        <View style={featuresStyles.stepContainer}>
            <Text style={featuresStyles.stepText}>{item}</Text>
        </View>
    );

    const saveMeal = async () => {
        try {
            setLoading(true);
            const newMeal = new Meal(
                Date.now().toString(),
                recipeName,
                caloriesAndMacros.calories,
                caloriesAndMacros.protein,
                caloriesAndMacros.carbs,
                caloriesAndMacros.fat,
                cookingTime,
                ingredientsAndQuantities,
                cookingProcess
            );

            const existingMeals = await AsyncStorage.getItem('meals');
            const meals = existingMeals && existingMeals !== '{}' ? JSON.parse(existingMeals) : [];
            meals.push(newMeal);
            await AsyncStorage.setItem('meals', JSON.stringify(meals));

            const existingIngredients = await AsyncStorage.getItem('ingredientsMap');
            const ingredients = existingIngredients ? JSON.parse(existingIngredients) : {};

            if (anyIngredientsMode === false) {
                for (const [ingredient, usedQuantity] of Object.entries(ingredientsAndQuantities)) {
                    if (typeof usedQuantity === 'string') {
                        const usedQuantityFloat = parseFloat(usedQuantity.replace(/[^0-9.-]/g, ''));
                        if (!isNaN(usedQuantityFloat)) {
                            if (ingredients[ingredient]) {
                                const currentQuantity = parseFloat(ingredients[ingredient].replace(/[^0-9.-]/g, ''));
                                if (!isNaN(currentQuantity)) {
                                    ingredients[ingredient] = (currentQuantity - usedQuantityFloat).toString();
                                }
                            }
                        }
                    }
                }
            }

            await AsyncStorage.setItem('ingredients', JSON.stringify(ingredients));
            const previous_recipes = await AsyncStorage.getItem('previous_recipes');
            let previous_recipesArray = previous_recipes ? JSON.parse(previous_recipes) : [];

            // Check if the array is empty or null and create it if necessary
            if (!Array.isArray(previous_recipesArray)) {
                previous_recipesArray = [];
            }

            // Push the new recipe name
            previous_recipesArray.push(newMeal.name);

            // Cap the array size at maxSize
            const maxSize = 6;
            if (previous_recipesArray.length > maxSize) {
                previous_recipesArray = previous_recipesArray.slice(-maxSize);
            }

            // Store the updated array in AsyncStorage
            await AsyncStorage.setItem('previous_recipes', JSON.stringify(previous_recipesArray));

            await updateDynamoIngredients();

            setLoading(false);
            navigation.navigate('MainScreen');

        } catch (error) {
            console.error(t('failedSavingMeal'), error);
            Alert.alert(t('error') + ', ', t('failedMealAlert'));
        }
    };

    const updateDynamoIngredients = async () => {
        const data = {
            userId: username,
            recipe: {
                recipeName: recipeName,
                cookingTime: cookingTime,
                caloriesAndMacros: {
                    calories: caloriesAndMacros.calories,
                    protein: caloriesAndMacros.protein,
                    carbs: caloriesAndMacros.carbs,
                    fat: caloriesAndMacros.fat,
                },
                ingredientsAndQuantities: ingredientsAndQuantities,
                cookingProcess: cookingProcess,
            },
            newRecipe: true
        };

        try {
            const monthlyGenerations = await AsyncStorage.getItem('monthlyGenerations');
            if (monthlyGenerations !== null) {
                const newMonthlyGenerations = (parseInt(monthlyGenerations, 10) - 1).toString();
                await AsyncStorage.setItem('monthlyGenerations', newMonthlyGenerations);
            }
            console.log('username: ' + username);
            const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
            const token = tokenResponse.body;
            console.log('token: ' + token);

            FitMyMacrosApiService.setAuthToken(token);
            await FitMyMacrosApiService.updateRecipes(data);
        } catch (error) {
            console.error('Error updating recipe:', error);
        }
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ScrollView style={globalStyles.containerMainGeneration}>
                <View style={featuresStyles.headerContainer}>
                    <View style={featuresStyles.titleContainer2}>
                        <Text style={featuresStyles.recipeName2}>{recipeName}</Text>
                        <TouchableOpacity onPress={handleFavoriteToggle}>
                            <Icon name={isFavorite ? "star" : "star-o"} size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </View>
                    <Text style={featuresStyles.cookingTime}>{cookingTime}</Text>
                </View>
                <View style={featuresStyles.macrosContainer}>
                    <Text style={featuresStyles.macrosText}>{energyUnit === 'kilocalories' ? t('calories') : t('kilojoules')}: {caloriesAndMacros.calories}</Text>
                    <Text style={featuresStyles.macrosText}>{t('protein')}: {normalizeUnit(caloriesAndMacros.protein)}</Text>
                    <Text style={featuresStyles.macrosText}>{t('carbs')}: {normalizeUnit(caloriesAndMacros.carbs)}</Text>
                    <Text style={featuresStyles.macrosText}>{t('fat')}: {normalizeUnit(caloriesAndMacros.fat)}</Text>
                </View>
                <View style={featuresStyles.sectionContainer}>
                    <Text style={featuresStyles.sectionTitle}>{t('ingredients')}</Text>
                    <FlatList
                        data={ingredients}
                        renderItem={renderIngredient}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <View style={featuresStyles.sectionContainer}>
                    <Text style={featuresStyles.sectionTitle}>{t('cookingProcess')}</Text>
                    <FlatList
                        data={cookingProcess}
                        renderItem={renderStep}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <Toast />
                <TouchableOpacity
                    style={featuresStyles.backButton}
                    onPress={() => { saveMeal() }}
                >
                    <Text style={featuresStyles.buttonText}>{t('useRecipe')}</Text>
                </TouchableOpacity>
            </ScrollView>
            {loading && (
                <View style={globalStyles.loadingOverlay}>
                    <TouchableWithoutFeedback>
                        <BlurView intensity={50} style={globalStyles.blurView}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </BlurView>
                    </TouchableWithoutFeedback>
                </View>
            )}
        </I18nextProvider>
    );
};

export default RecipeDetail;