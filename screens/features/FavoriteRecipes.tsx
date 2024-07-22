import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from 'globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Meal from 'model/Meal';
import { useIsFocused } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import Footer from 'utils/Footer';
import i18n from 'i18n';

interface Props {
    navigation: any;
}

const FavoriteRecipes: React.FC<Props> = ({ navigation }) => {
    const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
    const [energyUnit, setEnergy] = useState<string>('');
    const isFocused = useIsFocused();

    useEffect(() => {
        const loadFavoriteMeals = async () => {
            try {
                const favorites = await AsyncStorage.getItem('favoriteMeals');
                if (favorites) {
                    setFavoriteMeals(JSON.parse(favorites));
                }
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setEnergy(energy === null ? '' : energy);
            } catch (error) {
                console.error('Error loading favorite meals', error);
            }
        };
        loadFavoriteMeals();
    }, [isFocused]);

    return (
        <I18nextProvider i18n={i18n}>
            <ScrollView style={globalStyles.mealsContainer}>
                {favoriteMeals.filter(meal => meal.name !== null && meal.name !== undefined && meal.name !== '').map((meal, index) => (
                    <TouchableOpacity
                        key={index}
                        style={globalStyles.mealBox}
                        onPress={() => {
                            const recipeData = {
                                name: meal.name,
                                cookingTime: meal.cookingTime,
                                calories: meal.calories,
                                protein: meal.protein,
                                carbs: meal.carbs,
                                fat: meal.fat,
                                ingredients: meal.ingredients,
                                cookingProcess: meal.cookingProcess
                            };
                            console.log('Navigating with recipeData:', recipeData);
                            navigation.navigate('OpenRecipeDetail', { recipeData });
                        }}
                    >
                        <Text style={globalStyles.mealName}>{meal.name}</Text>
                        <Text style={globalStyles.mealCalories}>{meal.calories} {energyUnit}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Footer navigation={navigation} />
        </I18nextProvider>
    );
};

export default FavoriteRecipes;