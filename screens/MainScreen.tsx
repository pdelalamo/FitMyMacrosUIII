import React, { useEffect, useState, FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet, Button } from 'react-native';
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

const MainScreen: FC<Props> = ({ navigation }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [measurementUnit, setMeasurement] = useState<string>('');
    const [energyUnit, setEnergy] = useState<string>('');
    const [targetCalories, setTargetCalories] = useState<number>(0);
    const [targetProtein, setTargetProtein] = useState<number>(0);
    const [targetCarbs, setTargetCarbs] = useState<number>(0);
    const [targetFat, setTargetFat] = useState<number>(0);

    const isFocused = useIsFocused();

    useEffect(() => {
        loadTargetCalsAndMacros();
    }, []);

    useEffect(() => {
        loadDailyMeals();
    }, [isFocused]);

    const loadTargetCalsAndMacros = async () => {
        try {
            const storedValues = await Promise.all([
                AsyncStorage.getItem('targetCalories'),
                AsyncStorage.getItem('proteinPercentage'),
                AsyncStorage.getItem('carbsPercentage'),
                AsyncStorage.getItem('fatPercentage'),
            ]);

            const [calories, protein, carbs, fat] = storedValues.map(value => parseFloat(value || '0'));
            setTargetCalories(isFinite(calories) ? calories : 0);
            setTargetProtein(isFinite(protein) ? protein : 0);
            setTargetCarbs(isFinite(carbs) ? carbs : 0);
            setTargetFat(isFinite(fat) ? fat : 0);
        } catch (error) {
            console.error('Error loading calories and macronutrients:', error);
        }
    };

    const loadDailyMeals = async () => {
        try {
            const [mealsData, solid, energy] = await Promise.all([
                AsyncStorage.getItem('meals'),
                AsyncStorage.getItem('measurementSolid'),
                AsyncStorage.getItem('measurementEnergy'),
            ]);

            setMeasurement(solid || '');
            setEnergy(energy || '');
            if (mealsData) {
                const parsedMeals: Meal[] = JSON.parse(mealsData);
                setMeals(parsedMeals);
            }
        } catch (error) {
            console.error('Error loading daily meals:', error);
        }
    };

    const deleteMeal = async (mealToDelete: Meal) => {
        const updatedMeals = meals.filter(meal => meal.id !== mealToDelete.id);
        setMeals(updatedMeals);
        await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
    };

    const confirmDeleteMeal = (meal: Meal) => {
        setSelectedMeal(meal);
        setModalVisible(true);
    };

    const handleDeleteConfirmation = async () => {
        if (selectedMeal) {
            await deleteMeal(selectedMeal);
            setSelectedMeal(null);
            setModalVisible(false);
        }
    };

    const handleCancel = () => {
        setSelectedMeal(null);
        setModalVisible(false);
    };

    const generateRecipes = () => {
        navigation.navigate('RecipeGeneration');
    };

    const calculatePercentage = (consumed: number, target: number): number => {
        return target > 0 ? (consumed / target) * 100 : 0;
    };

    const totalCalories = calculateTotal(meals, 'calories');
    const proteinConsumed = calculateTotal(meals, 'protein');
    const carbsConsumed = calculateTotal(meals, 'carbs');
    const fatConsumed = calculateTotal(meals, 'fat');

    const calculateTotal = (items: Meal[], prop: 'calories' | 'protein' | 'carbs' | 'fat'): number => {
        return items.reduce((total, item) => total + parseFloat(item[prop].replace(/[^0-9.-]/g, '')), 0);
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMain}>
                <Header totalCalories={totalCalories} targetCalories={targetCalories} energyUnit={energyUnit} />
                <MacroOverview
                    protein={proteinConsumed}
                    targetProtein={targetProtein}
                    carbs={carbsConsumed}
                    targetCarbs={targetCarbs}
                    fat={fatConsumed}
                    targetFat={targetFat}
                    measurementUnit={measurementUnit}
                />
                <MealList meals={meals} navigation={navigation} energyUnit={energyUnit} confirmDeleteMeal={confirmDeleteMeal} />
                <AddMealButton generateRecipes={generateRecipes} />
                <Footer navigation={navigation} />
                <ConfirmationModal modalVisible={modalVisible} handleDeleteConfirmation={handleDeleteConfirmation} handleCancel={handleCancel} />
            </View>
        </I18nextProvider>
    );
};

const Header: FC<{ totalCalories: number; targetCalories: number; energyUnit: string }> = ({ totalCalories, targetCalories, energyUnit }) => (
    <View style={globalStyles.headerWithBackground}>
        <View style={globalStyles.caloriesContainer}>
            <CircularProgress size={100} strokeWidth={10} percentage={calculatePercentage(totalCalories, targetCalories)} color="green" />
            <Text style={globalStyles.caloriesText}>
                {totalCalories} {t('of')} {targetCalories} {energyUnit === 'kilocalories' ? 'kcal' : 'kJ'}
            </Text>
        </View>
    </View>
);

const MacroOverview: FC<{ protein: number; targetProtein: number; carbs: number; targetCarbs: number; fat: number; targetFat: number; measurementUnit: string }> = ({
    protein,
    targetProtein,
    carbs,
    targetCarbs,
    fat,
    targetFat,
    measurementUnit,
}) => (
    <View style={globalStyles.macrosContainer}>
        <MacroItem type="protein" value={protein} target={targetProtein} measurementUnit={measurementUnit} />
        <MacroItem type="carbs" value={carbs} target={targetCarbs} measurementUnit={measurementUnit} />
        <MacroItem type="fat" value={fat} target={targetFat} measurementUnit={measurementUnit} />
    </View>
);

const MacroItem: FC<{ type: string; value: number; target: number; measurementUnit: string }> = ({ type, value, target, measurementUnit }) => {
    const colorMap = { protein: 'blue', carbs: 'orange', fat: 'red' };
    return (
        <View style={globalStyles.macroBox}>
            <CircularProgress size={60} strokeWidth={6} percentage={calculatePercentage(value, target)} color={colorMap[type]} />
            <Text style={globalStyles.macroText}>{t(type)}:</Text>
            <Text style={globalStyles.macroText}>
                {value}/{target} {measurementUnit}
            </Text>
        </View>
    );
};

const MealList: FC<{ meals: Meal[]; navigation: any; energyUnit: string; confirmDeleteMeal: (meal: Meal) => void }> = ({ meals, navigation, energyUnit, confirmDeleteMeal }) => (
    <ScrollView style={globalStyles.mealsContainer}>
        {meals.map(meal => (
            <View key={meal.id} style={globalStyles.mealBox2}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
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
                    }}
                >
                    <Text style={globalStyles.mealName}>{meal.name}</Text>
                    <Text style={globalStyles.mealCalories}>
                        {meal.calories} {energyUnit}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDeleteMeal(meal)}>
                    <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
            </View>
        ))}
    </ScrollView>
);

const AddMealButton: FC<{ generateRecipes: () => void }> = ({ generateRecipes }) => (
    <TouchableOpacity style={globalStyles.addButton} onPress={generateRecipes}>
        <Text style={globalStyles.addButtonText}>{t('addMeal')}</Text>
    </TouchableOpacity>
);

const ConfirmationModal: FC<{ modalVisible: boolean; handleDeleteConfirmation: () => void; handleCancel: () => void }> = ({
    modalVisible,
    handleDeleteConfirmation,
    handleCancel,
}) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            handleCancel();
        }}
    >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>{t('confirmDeleteMeal')}</Text>
                <View style={styles.buttonContainer}>
                    <Button title={t('cancel')} onPress={handleCancel} />
                    <Button title={t('delete')} onPress={handleDeleteConfirmation} color="red" />
                </View>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default MainScreen;
