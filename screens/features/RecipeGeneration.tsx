import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import CheckBox from '@react-native-community/checkbox';
import SecurityApiService from 'services/SecurityApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { BlurView } from 'expo-blur';
import { generateRandomString } from 'utils/UtilFunctions';

interface Props {
    navigation: any;
}

const RecipeGeneration: React.FC<Props> = ({ navigation }) => {
    const [state, setState] = useState({
        modalVisible: false,
        cuisine: '',
        flavor: '',
        satiety: '',
        recipeTargetCalories: '',
        proteinPercentage: 30,
        carbsPercentage: 50,
        fatPercentage: 20,
        cuisineOpen: false,
        flavorOpen: false,
        satietyOpen: false,
        dietOpen: false,
        diet: '',
        cookingTimeOpen: false,
        cookingTime: '',
        occasionOpen: false,
        occasion: '',
        toggleCheckBox: false,
        username: '',
        opId: '',
        loading: false,
        weightPreference: '',
        energyUnit: '',
        generationsLeft: null as number | null,
    });

    const ITEMS = {
        FLAVORS: [
            'any', 'spicy', 'sweet', 'savory', 'sour', 'bitter', 'umami', 
            'salty', 'fruity', 'herby', 'earthy'
        ],
        CUISINES: [
            'any', 'african', 'american', 'mediterranean', 'asian', 
            'european', 'latinAmerican', 'middleEastern', 'indian', 
            'chinese', 'japanese', 'korean', 'thai'
        ],
        SATIETY_LEVELS: ['any', 'satiating', 'nonSatiating'],
        DIETS: [
            'none', 'vegan', 'vegetarian', 'glutenFree', 'paleo', 
            'pescatarian', 'dairyFree', 'nutFree', 'halal', 'kosher'
        ],
        COOKING_TIMES: ['30min', '1h', 'moreThan1h'],
        OCCASIONS: ['breakfast', 'lunch', 'snack', 'dinner', 'any'],
    };

    useEffect(() => {
        const loadStoredData = async (key: string, fallback: string | null = '') => {
            try {
                const value = await AsyncStorage.getItem(key);
                return value === null ? fallback : value;
            } catch (error) {
                console.error(`Error loading ${key}`, error);
                return fallback;
            }
        };

        const initState = async () => {
            const username = await loadStoredData('username');
            const energy = await loadStoredData('measurementEnergy');
            const solid = await loadStoredData('measurementSolid');
            const generationsStr = await loadStoredData('monthlyGenerations', '0');
            setState(prevState => ({
                ...prevState,
                username,
                energyUnit: energy,
                weightPreference: solid,
                generationsLeft: parseInt(generationsStr, 10),
            }));
        };

        initState();
    }, []);

    const calculateMacros = useCallback(() => {
        const total = parseInt(state.recipeTargetCalories, 10) || 0;
        const factor = state.weightPreference === 'grams' ? 1 : 0.03527396195;
        return {
            proteinGrams: Math.round((total * state.proteinPercentage) / 400) * factor,
            carbsGrams: Math.round((total * state.carbsPercentage) / 400) * factor,
            fatGrams: Math.round((total * state.fatPercentage) / 900) * factor,
        };
    }, [state.recipeTargetCalories, state.proteinPercentage, state.carbsPercentage, state.fatPercentage, state.weightPreference]);

    const handleGenerateRecipes = async () => {
        const totalPercentage = state.proteinPercentage + state.carbsPercentage + state.fatPercentage;
        if (!validateInputs(totalPercentage)) return;
        setState(prevState => ({ ...prevState, modalVisible: !prevState.modalVisible, loading: true }));

        try {
            const tokenResponse = await SecurityApiService.getToken(`username=${state.username}`);
            const token = tokenResponse.body;

            FitMyMacrosApiService.setAuthToken(token);
            const opId = generateRandomString(20);
            setState(prevState => ({ ...prevState, opId }));

            // API call logic here
            const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();
            const recipesResponse = await apiCallWithRetry({
                measureUnit: state.weightPreference,
                calories: Number(state.recipeTargetCalories),
                protein: proteinGrams,
                carbs: carbsGrams,
                fat: fatGrams,
                satietyLevel: state.satiety,
                anyIngredientsMode: state.toggleCheckBox,
                expandIngredients: false,
                glutenFree: false,
                vegan: false,
                vegetarian: false,
                cuisineStyle: state.cuisine,
                cookingTime: state.cookingTime,
                flavor: state.flavor,
                occasion: state.occasion,
                userId: state.username,
                precision: 'exactly',
                opId: state.opId,
            });
            const recipes = JSON.parse(recipesResponse.body);
            await AsyncStorage.setItem('recipesList', JSON.stringify(recipes));
            setState(prevState => ({ ...prevState, loading: false }));
            navigation.navigate('GeneratedRecipesList', {
                ...state,
                calories: Number(state.recipeTargetCalories),
                protein: proteinGrams,
                carbs: carbsGrams,
                fat: fatGrams,
                anyIngredientsMode: state.toggleCheckBox,
                glutenFree: false,
                vegan: false,
                vegetarian: false,
                cookingTime: state.cookingTime,
                userId: state.username,
                precision: 'exactly',
            });
        } catch (error) {
            console.error('Error generating recipes:', error);
            setState(prevState => ({ ...prevState, loading: false }));
        }
    };

    const apiCallWithRetry = async (params: Record<string, any>, maxRetries = 3, timeout = 30000) => {
        const makeApiCall = () => FitMyMacrosApiService.getRecipes(params);

        const callWithTimeout = () => {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, timeout);

                makeApiCall()
                    .then(response => {
                        clearTimeout(timer);
                        resolve(response);
                    })
                    .catch(error => {
                        clearTimeout(timer);
                        reject(error);
                    });
            });
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await callWithTimeout();
                return response; // Successful response, return it
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    throw new Error('All attempts to fetch recipes failed');
                }
            }
        }
    };

    const validateInputs = (totalPercentage: number): boolean => {
        const isValid = (unit: string, min: number, max: number) => {
            const value = Number(state.recipeTargetCalories);
            return !isNaN(value) && value >= min && value <= max;
        };

        if ((state.energyUnit === 'kilocalories' && !isValid('kilocalories', 200, 5000)) ||
            (state.energyUnit === 'kilojoules' && !isValid('kilojoules', 836, 20900))) {
            Alert.alert(t('error'), state.energyUnit === 'kilocalories' ? t('incorrectCaloriesTargetRecipe') : t('incorrectKilojoulesTargetRecipe'), [{ text: t('ok') }]);
            return false;
        } else if (totalPercentage !== 100) {
            Alert.alert(t('error'), t('macrosError'), [{ text: t('ok') }]);
            return false;
        } else if ([state.cuisine, state.flavor, state.satiety, state.cookingTime, state.occasion].includes('')) {
            Alert.alert(t('error'), t('dropdownsError'), [{ text: t('ok') }]);
            return false;
        }
        return true;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMainGeneration}>
                <View style={styles.header}>
                    <Text>{`${t('monthlyMealGenerationsLeft')}: ${state.generationsLeft}`}</Text>
                    {state.generationsLeft === 0 && (
                        <TouchableOpacity
                            style={[globalStyles.buyMoreCreditsButton, state.generationsLeft !== 0 && { backgroundColor: 'grey' }]}
                            disabled={state.generationsLeft > 0}
                            onPress={() => navigation.navigate('PurchaseCredits')}
                        >
                            <Text style={globalStyles.buttonTextWhite}>{t('buyMoreCredits')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <ScrollView>
                    {createDropDown('cuisine', ITEMS.CUISINES, 5000)}
                    {createDropDown('flavor', ITEMS.FLAVORS, 4000)}
                    {createDropDown('satiety', ITEMS.SATIETY_LEVELS, 3000)}
                    {createDropDown('cookingTime', ITEMS.COOKING_TIMES, 2000)}
                    {createDropDown('occasion', ITEMS.OCCASIONS, 1000)}
                    <TextInput
                        style={globalStyles.inputRecipe}
                        placeholder={state.energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
                        keyboardType="numeric"
                        value={state.recipeTargetCalories}
                        onChangeText={text => setState(prev => ({ ...prev, recipeTargetCalories: text }))}
                    />
                    {!validateCaloriesInput() && <Text style={{ color: 'red', marginTop: 10 }}>{state.energyUnit === 'kilocalories' ? t('incorrectCaloriesTargetRecipe') : t('incorrectKilojoulesTargetRecipe')}</Text>}
                    {createMacroSlider('protein', state.proteinPercentage, value => setState(prev => ({ ...prev, proteinPercentage: value })))}
                    {createMacroSlider('carbs', state.carbsPercentage, value => setState(prev => ({ ...prev, carbsPercentage: value })))}
                    {createMacroSlider('fat', state.fatPercentage, value => setState(prev => ({ ...prev, fatPercentage: value })))}
                    {renderMacroPercentages()}
                    {state.proteinPercentage + state.carbsPercentage + state.fatPercentage !== 100 && (
                        <Text style={{ color: 'red', marginTop: 10 }}>{t('percentageAlert')}</Text>
                    )}
                    <View style={globalStyles.checkboxContainer}>
                        <View style={globalStyles.checkboxRow}>
                            <CheckBox
                                style={styles.checkbox}
                                disabled={false}
                                value={state.toggleCheckBox}
                                onValueChange={newValue => setState(prev => ({ ...prev, toggleCheckBox: newValue }))}
                            />
                            <Text style={globalStyles.modalText}>{t('expandIngredients')}</Text>
                        </View>
                        <Text style={globalStyles.expandIngredientsInfo}>{t('expandIngredientsInfo')}</Text>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    style={[globalStyles.modalButton, state.generationsLeft === 0 && { backgroundColor: 'grey' }]}
                    disabled={state.generationsLeft === 0}
                    onPress={handleGenerateRecipes}
                >
                    <Text style={globalStyles.modalButtonText}>{t('generateRecipes')}</Text>
                </TouchableOpacity>
                {state.loading && (
                    <View style={globalStyles.loadingOverlay}>
                        <TouchableWithoutFeedback>
                            <BlurView intensity={50} style={globalStyles.blurView}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </BlurView>
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </View>
        </I18nextProvider>
    );

    function createDropDown(name: string, items: string[], zIndex: number) {
        const openStateName = `${name}Open`;
        const setOpenState = (open: boolean) => setState(prev => ({ ...prev, [openStateName]: open }));
        const setValueState = (value: string) => setState(prev => ({ ...prev, [name]: value }));
        return (
            <DropDownPicker
                open={state[openStateName]}
                value={state[name]}
                items={items.map(item => ({ label: t(`${name}.${item}`), value: item }))}
                setOpen={(open) => setOpenState(open)}
                setValue={(value) => setValueState(value)}
                placeholder={t(`select${capitalize(name)}`)}
                containerStyle={globalStyles.dropdown}
                zIndex={zIndex}
            />
        );
    }

    function createMacroSlider(name: 'protein' | 'carbs' | 'fat', value: number, setValue: (value: number) => void) {
        return (
            <View style={globalStyles.sliderContainer}>
                <Text style={globalStyles.sliderLabel}>{t(name)} (%)</Text>
                <View style={globalStyles.sliderRow}>
                    <TextInput
                        style={globalStyles.sliderInput}
                        keyboardType="numeric"
                        value={(value !== 0) ? value.toString() : ''}
                        onChangeText={(text) => setValue(validatePercentageInput(text))}
                    />
                    <Slider
                        style={globalStyles.slider}
                        minimumValue={0}
                        maximumValue={100}
                        value={value}
                        onValueChange={setValue}
                        step={1}
                        thumbTintColor="#337010"
                        minimumTrackTintColor="#337010"
                    />
                </View>
            </View>
        );
    }

    function validateCaloriesInput() {
        const calories = Number(state.recipeTargetCalories);
        const kilocaloriesRange = (calories >= 200 && calories <= 3000);
        const kilojoulesRange = (calories >= 836 && calories <= 12540);
        return (
            (state.energyUnit === 'kilocalories' && kilocaloriesRange) ||
            (state.energyUnit === 'kilojoules' && kilojoulesRange)
        );
    }

    function validatePercentageInput(text: string): number {
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) return value;
        return state.proteinPercentage;
    }

    function renderMacroPercentages() {
        const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();
        return (
            <>
                <Text>{t('protein')}: {proteinGrams} {state.weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                <Text>{t('carbs')}: {carbsGrams} {state.weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                <Text>{t('fat')}: {fatGrams} {state.weightPreference === 'grams' ? 'g' : 'oz'}</Text>
            </>
        )
    }

    function capitalize(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
};

const styles = {
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
    },
    checkbox: {
        marginBottom: '30%', marginLeft: '10%'
    }
};

export default RecipeGeneration;
