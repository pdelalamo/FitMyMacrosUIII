import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from 'globalStyles';
import Meal from 'model/Meal';
import Footer from 'utils/Footer';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18n';

interface Props {
  navigation: any;
}

const FavoriteRecipes: React.FC<Props> = ({ navigation }) => {
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [energyUnit, setEnergyUnit] = useState<string>('');
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchFavoriteMeals = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoriteMeals');
        const storedEnergyUnit = await AsyncStorage.getItem('measurementEnergy');

        if (storedFavorites) {
          setFavoriteMeals(JSON.parse(storedFavorites));
        }

        setEnergyUnit(storedEnergyUnit ?? '');
      } catch (error) {
        console.error('Error loading favorite meals:', error);
      }
    };

    fetchFavoriteMeals();
  }, [isFocused]);

  const navigateToRecipeDetail = (meal: Meal) => {
    const recipeData = {
      name: meal.name,
      cookingTime: meal.cookingTime,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      ingredients: meal.ingredients,
      cookingProcess: meal.cookingProcess,
    };
    console.log('Navigating with recipeData:', recipeData);

    navigation.navigate('OpenRecipeDetail', { recipeData });
  };

  const renderMealItem = (meal: Meal, index: number) => (
    <TouchableOpacity
      key={index}
      style={globalStyles.mealBox}
      onPress={() => navigateToRecipeDetail(meal)}
    >
      <Text style={globalStyles.mealName}>{meal.name}</Text>
      <Text style={globalStyles.mealCalories}>
        {meal.calories} {energyUnit}
      </Text>
    </TouchableOpacity>
  );

  return (
    <I18nextProvider i18n={i18n}>
      <ScrollView contentContainerStyle={globalStyles.mealsContainer}>
        {favoriteMeals
          .filter((meal) => meal.name)
          .map(renderMealItem)}
      </ScrollView>
      <Footer navigation={navigation} />
    </I18nextProvider>
  );
};

export default FavoriteRecipes;
