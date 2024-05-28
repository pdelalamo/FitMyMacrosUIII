import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from 'utils/CircularProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Meal from 'model/Meal';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';

interface Props {
    navigation: any;
}

const MainScreen: React.FC<Props> = ({ navigation }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [measurementUnit, setMeasurement] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [cuisine, setCuisine] = useState('');
    const [flavor, setFlavor] = useState('');
    const [recipeTargetCalories, setRecipeTargetCalories] = useState('');
    const [proteinPercentage, setProteinPercentage] = useState(30);
    const [carbsPercentage, setCarbsPercentage] = useState(50);
    const [fatPercentage, setFatPercentage] = useState(20);
    const [cuisineOpen, setCuisineOpen] = useState(false);
    const [flavorOpen, setFlavorOpen] = useState(false);

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const mealsData = await AsyncStorage.getItem('meals');
                const measurementSolid = await AsyncStorage.getItem('measurementSolid');
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
    }, []);

    const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);
    const targetCalories = 2500;

    const proteinConsumed = meals.reduce((total, meal) => total + meal.protein, 0);
    const targetProtein = 250;

    const carbsConsumed = meals.reduce((total, meal) => total + meal.carbs, 0);
    const targetCarbs = 300;

    const fatConsumed = meals.reduce((total, meal) => total + meal.fat, 0);
    const targetFat = 80;

    const calculateMacros = () => {
        const total = parseInt(recipeTargetCalories, 10) || 0;
        const proteinGrams = Math.round((total * proteinPercentage) / 400);
        const carbsGrams = Math.round((total * carbsPercentage) / 400);
        const fatGrams = Math.round((total * fatPercentage) / 900);
        return { proteinGrams, carbsGrams, fatGrams };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const handleGenerateRecipes = () => {
        if (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) <= 0 || Number(recipeTargetCalories) >= 5000) {
            // Show alert if calories is not a number in between 0 and 5000
            Alert.alert(
                t('error'),
                t('incorrectCalories'),
                [{ text: t('ok') }]
            );
            return;
        }
        const sum = proteinPercentage + carbsPercentage + fatPercentage;
        if (sum !== 100) {
            // Show alert if the sum is not equal to 100
            Alert.alert(
                t('error'),
                t('macrosError'),
                [{ text: t('ok') }]
            );
        } else {
            setModalVisible(!modalVisible);
            // Proceed with generating recipes
            // Your code for generating recipes goes here
        }
    };

    const validatePercentageInput = (text: string): number => {
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            return value;
        }
        return proteinPercentage; // Return previous value if input is invalid
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
                            <Text style={globalStyles.macroText}>{proteinConsumed}/{targetProtein}{measurementUnit}</Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress size={60} strokeWidth={6} percentage={(carbsConsumed / targetCarbs) * 100} color="orange" />
                            <Text style={globalStyles.macroText}>{carbsConsumed}/{targetCarbs}{measurementUnit}</Text>
                        </View>
                        <View style={globalStyles.macroBox}>
                            <CircularProgress size={60} strokeWidth={6} percentage={(fatConsumed / targetFat) * 100} color="red" />
                            <Text style={globalStyles.macroText}>{fatConsumed}/{targetFat}{measurementUnit}</Text>
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
                <TouchableOpacity style={globalStyles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={globalStyles.addButtonText}>{t('addMeal')}</Text>
                </TouchableOpacity>
                <View style={globalStyles.footer}>
                    <Ionicons name="home" size={35} color="white" />
                    <Ionicons name="search" size={35} color="white" />
                    <Ionicons name="add-circle" size={35} color="white" />
                    <Ionicons name="notifications" size={35} color="white" />
                    <Ionicons name="person" size={35} color="white" />
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={globalStyles.modalContainerRecipe}>
                        <View style={globalStyles.modalContentRecipe}>
                            <Text style={globalStyles.modalTitle}>{t('generateNewRecipe')}</Text>
                            <ScrollView>
                                <DropDownPicker
                                    open={cuisineOpen}
                                    value={cuisine}
                                    items={[
                                        { label: 'African', value: 'african' },
                                        { label: 'American', value: 'american' },
                                        { label: 'Mediterranean', value: 'mediterranean' },
                                        // Add more cuisines as needed
                                    ]}
                                    setOpen={setCuisineOpen}
                                    setValue={setCuisine}
                                    containerStyle={globalStyles.dropdown}
                                    zIndex={5000}
                                />
                                <DropDownPicker
                                    open={flavorOpen}
                                    value={flavor}
                                    items={[
                                        { label: 'Spicy', value: 'spicy' },
                                        { label: 'Sweet', value: 'sweet' },
                                        // Add more flavor profiles as needed
                                    ]}
                                    setOpen={setFlavorOpen}
                                    setValue={setFlavor}
                                    containerStyle={globalStyles.dropdown}
                                    zIndex={4000}
                                />
                                <TextInput
                                    style={globalStyles.inputRecipe}
                                    placeholder={t('targetCalories')}
                                    keyboardType="numeric"
                                    value={recipeTargetCalories}
                                    onChangeText={text => setRecipeTargetCalories(text)}
                                />
                                {(recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) <= 0 || Number(recipeTargetCalories) >= 5000) && (
                                    <Text style={{ color: 'red', marginTop: 10 }}>
                                        {t('incorrectCalories')}
                                    </Text>
                                )}
                                <View style={globalStyles.sliderContainer}>
                                    <Text style={{ flex: 1 }}>{t('protein')} (%)</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <TextInput
                                            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                            keyboardType="numeric"
                                            value={proteinPercentage.toString()}
                                            onChangeText={(text) => setProteinPercentage(validatePercentageInput(text))}
                                        />
                                        <Slider
                                            style={{ flex: 3, marginLeft: 10 }} // Adjust flex and margin as needed
                                            minimumValue={0}
                                            maximumValue={100}
                                            value={proteinPercentage}
                                            onValueChange={value => setProteinPercentage(value)}
                                            step={1}
                                            thumbTintColor="#337010"
                                            minimumTrackTintColor="#337010"
                                        />
                                    </View>
                                </View>
                                <View style={globalStyles.sliderContainer}>
                                    <Text>{t('carbs')} (%)</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <TextInput
                                            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                            keyboardType="numeric"
                                            value={carbsPercentage.toString()}
                                            onChangeText={(text) => setCarbsPercentage(validatePercentageInput(text))}
                                        />
                                        <Slider
                                            style={{ flex: 3, marginLeft: 10 }}
                                            minimumValue={0}
                                            maximumValue={100}
                                            value={carbsPercentage}
                                            onValueChange={value => setCarbsPercentage(value)}
                                            step={1}
                                            thumbTintColor="#337010"
                                            minimumTrackTintColor="#337010"
                                        />
                                    </View>
                                </View>
                                <View style={globalStyles.sliderContainer}>
                                    <Text>{t('fat')} (%)</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <TextInput
                                            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                            keyboardType="numeric"
                                            value={fatPercentage.toString()}
                                            onChangeText={(text) => setFatPercentage(validatePercentageInput(text))}
                                        />
                                        <Slider
                                            style={{ flex: 3, marginLeft: 10 }}
                                            minimumValue={0}
                                            maximumValue={100}
                                            value={fatPercentage}
                                            onValueChange={value => setFatPercentage(value)}
                                            step={1}
                                            thumbTintColor="#337010"
                                            minimumTrackTintColor="#337010"
                                        />
                                    </View>
                                </View>
                                <Text>{t('protein')}: {proteinGrams}g</Text>
                                <Text>{t('carbs')}: {carbsGrams}g</Text>
                                <Text>{t('fat')}: {fatGrams}g</Text>
                                {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
                                    <Text style={{ color: 'red', marginTop: 10 }}>
                                        {t('percentageAlert')}
                                    </Text>
                                )}
                            </ScrollView>
                            <TouchableOpacity
                                style={globalStyles.modalButton}
                                onPress={() => {
                                    // Add your function to generate recipes
                                    handleGenerateRecipes();
                                }}
                            >
                                <Text style={globalStyles.modalButtonText}>{t('generateRecipes')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </I18nextProvider>
    );
};

export default MainScreen;
