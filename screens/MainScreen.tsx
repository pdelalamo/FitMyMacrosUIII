import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from 'utils/CircularProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Meal from 'model/Meal';
import { useIsFocused } from '@react-navigation/native';

interface Props {
    navigation: any;
}

const MainScreen: React.FC<Props> = ({ navigation }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [measurementUnit, setMeasurement] = useState<string>('');
    const totalCalories = meals.reduce((total, meal) => total + parseFloat(meal.calories.replace(/[^0-9.-]/g, '')), 0);
    const targetCalories = 2500;
    const proteinConsumed = meals.reduce((total, meal) => total + parseFloat(meal.protein.replace(/[^0-9.-]/g, '')), 0);
    const targetProtein = 250;
    const carbsConsumed = meals.reduce((total, meal) => total + parseFloat(meal.carbs.replace(/[^0-9.-]/g, '')), 0);
    const targetCarbs = 300;
    const fatConsumed = meals.reduce((total, meal) => total + parseFloat(meal.fat.replace(/[^0-9.-]/g, '')), 0);
    const targetFat = 80;
    const isFocused = useIsFocused();

    const getWeightPreference = async () => {
        const storedPreferences = await AsyncStorage.getItem('userPreferences');
        if (storedPreferences) {
            const parsedPreferences = JSON.parse(storedPreferences);
            return parsedPreferences.measurementPreferences.weight;
        }
        return null;
    };

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const mealsData = await AsyncStorage.getItem('meals');
                const measurementSolid = await getWeightPreference();
                setMeasurement(measurementSolid === null ? '' : measurementSolid);
                if (mealsData) {
                    const parsedMeals: Meal[] = JSON.parse(mealsData);
                    setMeals(parsedMeals);
                }
            } catch (error) {
                console.error('Error loading daily meals:', error);
            }
        };

        loadDailyMeals();
    }, [isFocused]);

    function generateRecipes() {
        navigation.navigate('RecipeGeneration');
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMain}>
                <View style={globalStyles.headerWithBackground}>
                    <View style={globalStyles.caloriesContainer}>
                        <CircularProgress size={100} strokeWidth={10} percentage={(totalCalories / targetCalories) * 100} color="green" />
                        <Text style={globalStyles.caloriesText}>{totalCalories} {t('of')} {targetCalories} kcal</Text>
                    </View>
                    <View style={globalStyles.macrosContainer}>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress size={60} strokeWidth={6} percentage={(proteinConsumed / targetProtein) * 100} color="blue" />
                            <Text style={globalStyles.macroText}>{t('protein')}:</Text>
                            <Text style={globalStyles.macroText}>{proteinConsumed}/{targetProtein} {measurementUnit}</Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress size={60} strokeWidth={6} percentage={(carbsConsumed / targetCarbs) * 100} color="orange" />
                            <Text style={globalStyles.macroText}>{t('carbs')}:</Text>
                            <Text style={globalStyles.macroText}>{carbsConsumed}/{targetCarbs} {measurementUnit}</Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress size={60} strokeWidth={6} percentage={(fatConsumed / targetFat) * 100} color="red" />
                            <Text style={globalStyles.macroText}>{t('fat')}:</Text>
                            <Text style={globalStyles.macroText}>{fatConsumed}/{targetFat} {measurementUnit}</Text>
                        </View>
                    </View>
                </View>
                <ScrollView style={globalStyles.mealsContainer}>
                    {meals.map(meal => (
                        <View key={meal.id} style={globalStyles.mealBox}>
                            <Text style={globalStyles.mealName}>{meal.name}</Text>
                            <Text style={globalStyles.mealCalories}>{meal.calories} kcal</Text>
                        </View>
                    ))}
                </ScrollView>
                <TouchableOpacity style={globalStyles.addButton} onPress={() => generateRecipes()}>
                    <Text style={globalStyles.addButtonText}>{t('addMeal')}</Text>
                </TouchableOpacity>
                <View style={globalStyles.footer}>
                    <Ionicons name="home" size={35} color="white" />
                    <Ionicons name="search" size={35} color="white" />
                    <Ionicons name="add-circle" size={35} color="white" />
                    <Ionicons name="notifications" size={35} color="white" />
                    <Ionicons name="person" size={35} color="white" />
                </View>
            </View>
        </I18nextProvider>
    );
};

export default MainScreen;
