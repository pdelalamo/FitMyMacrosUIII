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
                setUsername(await AsyncStorage.getItem('username'));
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
                    setIsFavorite(favoritesArray.some((meal: any) => meal.recipeName === recipeData.recipeName));
                }
            } catch (error) {
                console.error('Error loading favorite meals', error);
            }
        };
        loadUsername();
        checkIfFavorite();
    }, []);

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
            //await AsyncStorage.setItem('favoriteMeals', JSON.stringify([[]]));
            const favorites = await AsyncStorage.getItem('favoriteMeals');
            let favoritesArray = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favoritesArray = favoritesArray.filter((meal: any) => meal.recipeName !== recipeData.recipeName);
                Toast.show({
                    type: 'success',
                    text1: t('removedRecipe'),
                });
            } else {
                favoritesArray.push(recipeData);
                Toast.show({
                    type: 'success',
                    text1: t('addedRecipe'),
                });
            }

            await AsyncStorage.setItem('favoriteMeals', JSON.stringify(favoritesArray));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error updating favorite meals', error);
        }
    };

    const renderIngredient = ({ item }: { item: [string, string] }) => (
        <View style={styles.ingredientContainer}>
            <Text style={styles.ingredientName}>{item[0]}</Text>
            <Text style={styles.ingredientQuantity}>{item[1]}</Text>
        </View>
    );

    const renderStep = ({ item }: { item: string }) => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepText}>{item}</Text>
        </View>
    );

    /**
     * This function saves the generated meal to the async storage, and updates the available ingredients and quantities, both
     * in the async storage and in dynamoDB
     */
    const saveMeal = async () => {
        try {
            setLoading(true);
            // Create a new meal object
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

            // Retrieve the existing meals from AsyncStorage
            const existingMeals = await AsyncStorage.getItem('meals');
            const meals = existingMeals && existingMeals !== '{}' ? JSON.parse(existingMeals) : [];

            // Add the new meal to the list
            meals.push(newMeal);

            // Save the updated meals list back to AsyncStorage
            await AsyncStorage.setItem('meals', JSON.stringify(meals));


            // Retrieve the existing ingredients from AsyncStorage
            const existingIngredients = await AsyncStorage.getItem('ingredientsMap');
            const ingredients = existingIngredients ? JSON.parse(existingIngredients) : {};

            if (anyIngredientsMode) {
                // Subtract the used quantities of the ingredients
                for (const [ingredient, usedQuantity] of Object.entries(ingredientsAndQuantities)) {
                    if (typeof usedQuantity === 'string') {
                        // Extract numeric part from the usedQuantity
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

            // Save the updated ingredients back to AsyncStorage
            await AsyncStorage.setItem('ingredients', JSON.stringify(ingredients));
            //update ingredients and recipes in dynamoDB
            await updateDynamoIngredients();

            setLoading(false);
            // Navigate to the MainScreen
            navigation.navigate('MainScreen');

        } catch (error) {
            console.error(t('failedSavingMeal'), error);
            Alert.alert(t('error') + ', ', t('failedMealAlert'));
        }
    };

    /**
     * This function invokes the function that will update the available ingredients and quantities of the user in dynamoDB
     */
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
            }
        };

        try {
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
                <View style={styles.headerContainer}>
                    <Text style={styles.recipeName}>{recipeName}</Text>
                    <Text style={styles.cookingTime}>{cookingTime}</Text>
                </View>
                <View style={styles.headerContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.recipeName}>{recipeName}</Text>
                        <TouchableOpacity onPress={handleFavoriteToggle}>
                            <Icon name={isFavorite ? "star" : "star-o"} size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cookingTime}>{cookingTime}</Text>
                </View>
                <View style={styles.macrosContainer}>
                    <Text style={styles.macrosText}>{energyUnit === 'kilocalories' ? t('calories') : t('kilojoules')}: {caloriesAndMacros.calories}</Text>
                    <Text style={styles.macrosText}>{t('protein')}: {caloriesAndMacros.protein}</Text>
                    <Text style={styles.macrosText}>{t('carbs')}: {caloriesAndMacros.carbs}</Text>
                    <Text style={styles.macrosText}>{t('fat')}: {caloriesAndMacros.fat}</Text>
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{t('ingredients')}</Text>
                    <FlatList
                        data={ingredients}
                        renderItem={renderIngredient}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{t('cookingProcess')}</Text>
                    <FlatList
                        data={cookingProcess}
                        renderItem={renderStep}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <Toast />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => { saveMeal() }}
                >
                    <Text style={styles.buttonText}>{t('useRecipe')}</Text>
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

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recipeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    cookingTime: {
        fontSize: 16,
        color: '#777',
        marginVertical: 10,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    macrosText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    sectionContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
    },
    ingredientContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    ingredientName: {
        fontSize: 16,
        color: '#333',
    },
    ingredientQuantity: {
        fontSize: 16,
        color: '#666',
    },
    stepContainer: {
        marginVertical: 5,
    },
    stepText: {
        fontSize: 16,
        color: '#333',
    },
    backButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 60,
        marginHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RecipeDetail;