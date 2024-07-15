import i18n from 'i18n';
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

interface Props {
    navigation: any;
    route: any;
}

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

    useEffect(() => {
        const loadUsername = async () => {
            try {
                const uname = await AsyncStorage.getItem('username');
                setUsername(uname === null ? '' : uname);
            } catch (error) {
                console.error('Error loading username', error);
            }
        };
        const loadPreferences = async () => {
            console.log('logs work');
            try {
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setEnergy(energy === null ? '' : energy);
                const solid = await AsyncStorage.getItem('measurementSolid');
                setWeightPreference(solid === null ? '' : solid);
            } catch (error) {
                console.error('Error loading preferences', error);
            }
        };
        loadUsername();
        loadPreferences();
    }, []);

    const calculateMacros = () => {
        const total = parseInt(recipeTargetCalories, 10) || 0;
        const proteinGrams = weightPreference === 'grams' ? Math.round((total * proteinPercentage) / 400) : Math.round((total * proteinPercentage) / 400 * 0.03527396195);
        const carbsGrams = weightPreference === 'grams' ? Math.round((total * carbsPercentage) / 400) : Math.round((total * carbsPercentage) / 400 * 0.03527396195);
        const fatGrams = weightPreference === 'grams' ? Math.round((total * fatPercentage) / 900) : Math.round((total * fatPercentage) / 900 * 0.03527396195);
        return { proteinGrams, carbsGrams, fatGrams };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const handleSubmit = async () => {
        console.log('Form Submitted');
        console.log('Current state:', {
            restaurantName,
            cuisineType,
            mealTime,
            recipeTargetCalories,
            proteinGrams,
            carbsGrams,
            fatGrams,
            energyUnit,
        });
        if (!cuisineType || !mealTime || !recipeTargetCalories || !proteinGrams || !carbsGrams || !fatGrams) {
            Toast.show(t('restaurantForm.missingFields'), {
                duration: Toast.durations.LONG,
            });
            return;
        } else if (energyUnit === 'kilocalories' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 200 || Number(recipeTargetCalories) > 5000)) {
            // Show alert if calories is not a number in between 200 and 5000
            Alert.alert(
                t('error'),
                t('incorrectCaloriesTargetRecipe'),
                [{ text: t('ok') }]
            );
            return;
        } else if (energyUnit === 'kilojoules' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 836 || Number(recipeTargetCalories) > 20900)) {
            // Show alert if kJ is not a number in between 836 and 20900
            Alert.alert(
                t('error'),
                t('incorrectKilojoulesTargetRecipe'),
                [{ text: t('ok') }]
            );
            return;
        } else if (proteinPercentage + carbsPercentage + fatPercentage !== 100) {
            // Show alert if the sum is not equal to 100
            Alert.alert(
                t('error'),
                t('macrosError'),
                [{ text: t('ok') }]
            );
        } else {

            const data = {
                restaurantName,
                cuisineType,
                mealTime,
                targetCalories: parseInt(recipeTargetCalories),
                targetProtein: proteinGrams,
                targetCarbs: carbsGrams,
                targetFats: fatGrams,
                weightPreference,
            };
            setLoading(true);
            const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
            const token = tokenResponse.body;
            console.log('token: ' + token);

            FitMyMacrosApiService.setAuthToken(token);
            const restaurantRecommendation = await FitMyMacrosApiService.getRestaurantRecommendation(data);
            setLoading(false);
            navigation.navigate('RestaurantRecommendationDetail', restaurantRecommendation);
        }

    };

    const validatePercentageInput = (text: string): number => {
        if (text === '') {
            return 0; // Treat empty input as 0
        }
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            return value;
        }
        return proteinPercentage;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>{t('restaurantForm.restaurantName')}</Text>
                <TextInput
                    style={styles.input}
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                    placeholder={t('restaurantForm.enterRestaurantName')}
                />

                <Text style={styles.label}>{t('restaurantForm.cuisineType')}</Text>
                <TextInput
                    style={styles.input}
                    value={cuisineType}
                    onChangeText={setCuisineType}
                    placeholder={t('restaurantForm.enterCuisineType')}
                />

                <Text style={styles.label}>{t('restaurantForm.mealTime')}</Text>
                <TextInput
                    style={styles.input}
                    value={mealTime}
                    onChangeText={setMealTime}
                    placeholder={t('restaurantForm.enterMealTime')}
                />

                <TextInput
                    style={globalStyles.inputRecipe}
                    placeholder={energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
                    keyboardType="numeric"
                    value={recipeTargetCalories}
                    onChangeText={text => setRecipeTargetCalories(text)}
                />
                {(energyUnit === 'kilocalories' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 200 || Number(recipeTargetCalories) > 3000)) && (
                    <Text style={{ color: 'red', marginTop: 10 }}>{t('incorrectCaloriesTargetRecipe')}</Text>
                )}
                {(energyUnit === 'kilojoules' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 836 || Number(recipeTargetCalories) > 12540)) && (
                    <Text style={{ color: 'red', marginTop: 10 }}>{t('incorrectKilojoulesTargetRecipe')}</Text>
                )}
                <View style={globalStyles.sliderContainer}>
                    <Text style={{ flex: 1 }}>{t('protein')} (%)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <TextInput
                            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                            keyboardType="numeric"
                            value={proteinPercentage !== 0 ? proteinPercentage.toString() : ''}
                            onChangeText={(text) => setProteinPercentage(validatePercentageInput(text))}
                        />
                        <Slider
                            style={{ flex: 3, marginLeft: 10 }}
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
                            value={carbsPercentage !== 0 ? carbsPercentage.toString() : ''}
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
                            value={fatPercentage !== 0 ? fatPercentage.toString() : ''}
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
                <Text>{t('protein')}: {proteinGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                <Text>{t('carbs')}: {carbsGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                <Text>{t('fat')}: {fatGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
                    <Text style={{ color: 'red', marginTop: 10 }}>
                        {t('percentageAlert')}
                    </Text>
                )}
                <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => handleSubmit()}>
                    <Text style={globalStyles.buttonText}>{t('restaurantForm.submit')}</Text>
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
    container: {
        flexGrow: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#388E3C',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
    },
});

export default RestaurantForm;