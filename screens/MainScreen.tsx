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
import Footer from 'utils/Footer';

interface Props {
    navigation: any;
}

const MainScreen: React.FC<Props> = ({ navigation }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [measurementUnit, setMeasurement] = useState<string>('');
    const [energyUnit, setEnergy] = useState<string>('');
    const [targetCalories, setTargetCalories] = useState<number>(0);
    const [targetProtein, setTargetProtein] = useState<number>(0);
    const [targetCarbs, setTargetCarbs] = useState<number>(0);
    const [targetFat, setTargetFat] = useState<number>(0);

    const totalCalories = meals.reduce((total, meal) => total + parseFloat(meal.calories.replace(/[^0-9.-]/g, '')), 0);
    const proteinConsumed = meals.reduce((total, meal) => total + parseFloat(meal.protein.replace(/[^0-9.-]/g, '')), 0);
    const carbsConsumed = meals.reduce((total, meal) => total + parseFloat(meal.carbs.replace(/[^0-9.-]/g, '')), 0);
    const fatConsumed = meals.reduce((total, meal) => total + parseFloat(meal.fat.replace(/[^0-9.-]/g, '')), 0);
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
        const loadTargetCalsAndMacros = async () => {
            try {
                const storedTargetCalories = await AsyncStorage.getItem('targetCalories');
                const storedTargetProtein = await AsyncStorage.getItem('proteinPercentage');
                const storedTargetCarbs = await AsyncStorage.getItem('carbsPercentage');
                const storedTargetFat = await AsyncStorage.getItem('fatPercentage');

                const targetCalories = storedTargetCalories ? parseFloat(storedTargetCalories) : 0;
                const targetProtein = storedTargetProtein ? parseFloat(storedTargetProtein) : 0;
                const targetCarbs = storedTargetCarbs ? parseFloat(storedTargetCarbs) : 0;
                const targetFat = storedTargetFat ? parseFloat(storedTargetFat) : 0;

                // Ensure that no value is Infinity or NaN
                setTargetCalories(isFinite(targetCalories) ? targetCalories : 0);
                setTargetProtein(isFinite(targetProtein) ? targetProtein : 0);
                setTargetCarbs(isFinite(targetCarbs) ? targetCarbs : 0);
                setTargetFat(isFinite(targetFat) ? targetFat : 0);
            } catch (error) {
                console.error('Error loading calories and macronutrients:', error);
            }
        };

        loadTargetCalsAndMacros();
    }, []);

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const mealsData = await AsyncStorage.getItem('meals');
                const measurementSolid = await getWeightPreference();
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setMeasurement(measurementSolid === null ? '' : measurementSolid);
                setEnergy(energy === null ? '' : energy);
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
    }

    // Safety check for percentages
    const calculatePercentage = (consumed: number, target: number) => {
        return target > 0 ? (consumed / target) * 100 : 0;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMain}>
                <View style={globalStyles.headerWithBackground}>
                    <View style={globalStyles.caloriesContainer}>
                        <CircularProgress
                            size={100}
                            strokeWidth={10}
                            percentage={calculatePercentage(totalCalories, targetCalories)}
                            color="green"
                        />
                        <Text style={globalStyles.caloriesText}>
                            {totalCalories} {t('of')} {targetCalories} {energyUnit === 'kilocalories' ? 'kcal' : 'kJ'}
                        </Text>
                    </View>
                    <View style={globalStyles.macrosContainer}>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress
                                size={60}
                                strokeWidth={6}
                                percentage={calculatePercentage(proteinConsumed, targetProtein)}
                                color="blue"
                            />
                            <Text style={globalStyles.macroText}>{t('protein')}:</Text>
                            <Text style={globalStyles.macroText}>
                                {proteinConsumed}/{targetProtein} {measurementUnit}
                            </Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress
                                size={60}
                                strokeWidth={6}
                                percentage={calculatePercentage(carbsConsumed, targetCarbs)}
                                color="orange"
                            />
                            <Text style={globalStyles.macroText}>{t('carbs')}:</Text>
                            <Text style={globalStyles.macroText}>
                                {carbsConsumed}/{targetCarbs} {measurementUnit}
                            </Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress
                                size={60}
                                strokeWidth={6}
                                percentage={calculatePercentage(fatConsumed, targetFat)}
                                color="red"
                            />
                            <Text style={globalStyles.macroText}>{t('fat')}:</Text>
                            <Text style={globalStyles.macroText}>
                                {fatConsumed}/{targetFat} {measurementUnit}
                            </Text>
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
                <Footer navigation={navigation} />
            </View>
        </I18nextProvider>
    );
};

export default MainScreen;
