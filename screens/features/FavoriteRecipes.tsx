import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from 'globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from 'utils/Footer';

const FavoriteRecipes = ({ navigation }) => {
    const [favoriteMeals, setFavoriteMeals] = useState([]);

    useEffect(() => {
        const loadFavoriteMeals = async () => {
            try {
                const favorites = await AsyncStorage.getItem('favoriteMeals');
                if (favorites) {
                    setFavoriteMeals(JSON.parse(favorites));
                }
            } catch (error) {
                console.error('Error loading favorite meals', error);
            }
        };
        loadFavoriteMeals();
    }, []);

    return (
        <ScrollView style={globalStyles.mealsContainer}>
            {favoriteMeals.map((meal, index) => (
                <TouchableOpacity
                    key={index}
                    style={globalStyles.mealBox}
                    onPress={() => {
                        const recipeData = {
                            recipeName: meal.recipeName,
                            cookingTime: meal.cookingTime,
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            ingredientsAndQuantities: meal.ingredientsAndQuantities,
                            cookingProcess: meal.cookingProcess
                        };
                        console.log('Navigating with recipeData:', recipeData);
                        navigation.navigate('OpenRecipeDetail', { recipeData });
                    }}
                >
                    <Text style={globalStyles.mealName}>{meal.recipeName}</Text>
                    <Text style={globalStyles.mealCalories}>{meal.calories} kcal</Text>
                </TouchableOpacity>
            ))}
            <Footer navigation={navigation} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Add your styles here if needed
});

export default FavoriteRecipes;