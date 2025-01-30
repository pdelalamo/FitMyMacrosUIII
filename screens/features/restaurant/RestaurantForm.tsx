import React, { useState, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import { globalStyles } from 'globalStyles';
import Slider from '@react-native-community/slider';
import { t } from 'i18next';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import SecurityApiService from 'services/SecurityApiService';
import { BlurView } from 'expo-blur';
import Footer from 'utils/Footer';
import { restaurantStyles } from './restaurantStyles';

interface Props {
    navigation: any;
    route: any;
}

type Macros = {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
};

type Recommendation = {
    optionName: string;
    energyAndMacros: Macros;
};

const RestaurantForm: React.FC<Props> = ({ route, navigation }) => {
    const [restaurantName, setRestaurantName] = useState('');
    const [cuisineType, setCuisineType] = useState('');
    const [mealTime, setMealTime] = useState('');
    const [weightPreference, setWeightPreference] = useState('');
    const [energyUnit, setEnergy] = useState<string>('');
    const [recipeTargetCalories, setRecipeTargetCalories] = useState('');
    const [proteinPercentage, setProteinPercentage] = useState(30);
    const [carbsPercentage, setCarbsPercentage] = useState(50);
    const [fatPercentage, setFatPercentage] = useState(20);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [generationsLeft, setGenerationsLeft] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([
            loadUsername(),
            loadPreferences(),
            fetchGenerationsLeft()
        ]);
    };

    const loadUsername = async () => {
        try {
            const uname = await AsyncStorage.getItem('username');
            setUsername(uname || '');
        } catch (error) {
            console.error('Error loading username', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const energy = await AsyncStorage.getItem('measurementEnergy');
            setEnergy(energy || '');
            const solid = await AsyncStorage.getItem('measurementSolid');
            setWeightPreference(solid || '');
        } catch (error) {
            console.error('Error loading preferences', error);
        }
    };

    const fetchGenerationsLeft = async () => {
        try {
            const value = await AsyncStorage.getItem('monthlyGenerations');
            setGenerationsLeft(value ? parseInt(value, 10) : 0);
        } catch (error) {
            console.error("Error retrieving generations left:", error);
        }
    };

    const calculateMacros = () => {
        const totalCalories = parseInt(recipeTargetCalories, 10) || 0;
        const conversionFactor = weightPreference === 'grams' ? 1 : 0.03527396195;
        return {
            proteinGrams: Math.round((totalCalories * proteinPercentage) / 400 * conversionFactor),
            carbsGrams: Math.round((totalCalories * carbsPercentage) / 400 * conversionFactor),
            fatGrams: Math.round((totalCalories * fatPercentage) / 900 * conversionFactor)
        };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        const data = {
            restaurantName,
            cuisineType,
            mealTime,
            targetEnergy: recipeTargetCalories,
            protein: proteinGrams,
            carbs: carbsGrams,
            fat: fatGrams,
            energyUnit,
            weightUnit: weightPreference
        };

        try {
            setLoading(true);
            const token = await fetchAuthToken();
            const restaurantRecommendation = await fetchRestaurantRecommendation(data, token);
            setLoading(false);

            if (restaurantRecommendation) {
                navigation.navigate('RestaurantRecommendationDetail', { restaurantRecommendation });
            } else {
                showAlert(t('error'), t('recommendationError'));
            }
        } catch (error) {
            setLoading(false);
            showAlert(t('error'), t('submissionError'));
        }
    };

    const fetchAuthToken = async () => {
        const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
        return tokenResponse.body;
    };

    const fetchRestaurantRecommendation = async (data: any, token: string) => {
        FitMyMacrosApiService.setAuthToken(token);
        const response = await FitMyMacrosApiService.getRestaurantRecommendation(data);
        if (response.statusCode === 200) {
            return JSON.parse(response.body) as Recommendation[];
        }
        return null;
    };

    const isFormValid = () => {
        if (!cuisineType || !mealTime || !recipeTargetCalories || !proteinGrams || !carbsGrams || !fatGrams) {
            showAlert(t('error'), t('missingFields'));
            return false;
        }
        if (!isCaloriesValid()) return false;
        if (proteinPercentage + carbsPercentage + fatPercentage !== 100) {
            showAlert(t('error'), t('macrosError'));
            return false;
        }
        return true;
    };

    const isCaloriesValid = () => {
        const isValid = (min: number, max: number) => {
            const value = parseInt(recipeTargetCalories, 10);
            return value >= min && value <= max;
        };

        if (energyUnit === 'kilocalories') {
            if (!isValid(200, 5000)) {
                showAlert(t('error'), t('incorrectCaloriesTargetRecipe'));
                return false;
            }
        } else if (energyUnit === 'kilojoules') {
            if (!isValid(836, 20900)) {
                showAlert(t('error'), t('incorrectKilojoulesTargetRecipe'));
                return false;
            }
        }
        return true;
    };

    const showAlert = (title: string, message: string) => {
        Alert.alert(title, message, [{ text: t('ok') }]);
    };

    const validatePercentageInput = (text: string): number => {
        const value = parseInt(text, 10);
        if (value >= 0 && value <= 100) return value;
        return proteinPercentage;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={styles.header}>
                <Text>{t('monthlyMealGenerationsLeft')}: {generationsLeft}</Text>
                {generationsLeft === 0 && (
                    <TouchableOpacity
                        style={[globalStyles.buyMoreCreditsButton, { backgroundColor: 'grey' }]}
                        disabled={generationsLeft > 0}
                        onPress={() => navigation.navigate('PurchaseCredits')}
                    >
                        <Text style={globalStyles.buttonTextWhite}>{t('buyMoreCredits')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={restaurantStyles.container}>
                <Text style={restaurantStyles.label}>{t('restaurantForm.restaurantName')}</Text>
                <TextInput
                    style={restaurantStyles.input}
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                    placeholder={t('restaurantForm.enterRestaurantName')}
                />
                {/* Other form fields */}
                <SubmitButton onSubmit={handleSubmit} disabled={generationsLeft === 0} />
            </ScrollView>

            {loading && (
                <View style={globalStyles.loadingOverlay}>
                    <BlurView intensity={50} style={globalStyles.blurView}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </BlurView>
                </View>
            )}

            <Footer navigation={navigation} />
        </I18nextProvider>
    );
};

// Reusable Submit Button Component
const SubmitButton: React.FC<{ onSubmit: () => void, disabled: boolean }> = ({ onSubmit, disabled }) => (
    <TouchableOpacity
        style={[globalStyles.buttonGreen, disabled && { backgroundColor: 'grey' }]}
        disabled={disabled}
        onPress={onSubmit}
    >
        <Text style={globalStyles.buttonText}>{t('restaurantForm.submit')}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 10,
    },
});

export default RestaurantForm;
