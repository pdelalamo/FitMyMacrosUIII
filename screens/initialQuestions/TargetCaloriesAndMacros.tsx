import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Alert,
    TextInput,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';

interface Props {
    navigation: any;
}

const TargetCaloriesAndMacros: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const [energyUnit, setEnergyUnit] = useState('');
    const [weightUnit, setWeightUnit] = useState('');
    const [targetCalories, setTargetCalories] = useState('');
    const [proteinPercentage, setProteinPercentage] = useState(30);
    const [carbsPercentage, setCarbsPercentage] = useState(50);
    const [fatPercentage, setFatPercentage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

    const loadUserData = useCallback(async () => {
        try {
            const uname = await AsyncStorage.getItem('username');
            const energy = await AsyncStorage.getItem('measurementEnergy');
            const weight = await AsyncStorage.getItem('measurementSolid');
            setUsername(uname || '');
            setEnergyUnit(energy || '');
            setWeightUnit(weight || '');
        } catch (error) {
            console.error('Error loading user data', error);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const calculateMacros = useCallback(() => {
        const totalCalories = parseInt(targetCalories, 10) || 0;
        const conversionFactor = weightUnit === 'grams' ? 1 : 0.03527396195;
        const proteinGrams = Math.round((totalCalories * proteinPercentage) / 400 * conversionFactor);
        const carbsGrams = Math.round((totalCalories * carbsPercentage) / 400 * conversionFactor);
        const fatGrams = Math.round((totalCalories * fatPercentage) / 900 * conversionFactor);
        return { proteinGrams, carbsGrams, fatGrams };
    }, [targetCalories, proteinPercentage, carbsPercentage, fatPercentage, weightUnit]);

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const validatePercentageInput = (text: string, defaultValue: number) => {
        const value = parseInt(text, 10);
        return Number.isNaN(value) || value < 0 || value > 100 ? defaultValue : value;
    };

    const validateTargetCalories = (unit: string, calories: string) => {
        const cal = Number(calories);
        return unit === 'kilocalories'
            ? cal >= 1000 && cal <= 10000
            : cal >= 4184 && cal <= 41840;
    };

    const handleSaveSettings = async () => {
        const isValidCalories = validateTargetCalories(energyUnit, targetCalories);

        if (!isValidCalories) {
            const errorMessage = energyUnit === 'kilocalories' ? t('incorrectCaloriesTarget') : t('incorrectKilojoulesTarget');
            Alert.alert(t('error'), errorMessage, [{ text: t('ok') }]);
            return;
        }

        if (proteinPercentage + carbsPercentage + fatPercentage !== 100) {
            Alert.alert(t('error'), t('macrosError'), [{ text: t('ok') }]);
            return;
        }

        setLoading(true);
        try {
            await AsyncStorage.setItem('targetCalories', targetCalories);
            await AsyncStorage.setItem('proteinPercentage', proteinGrams.toString());
            await AsyncStorage.setItem('carbsPercentage', carbsGrams.toString());
            await AsyncStorage.setItem('fatPercentage', fatGrams.toString());
            navigation.navigate('FreeTrialScreen');
        } catch (error) {
            console.error('Error saving settings', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMacroSlider = (label: string, percentage: number, setPercentage: Function) => (
        <View style={globalStyles.sliderContainer}>
            <Text style={{ flex: 1 }}>{`${label} (%)`}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <TextInput
                    style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                    keyboardType="numeric"
                    value={percentage !== 0 ? percentage.toString() : ''}
                    onChangeText={(text) => setPercentage(validatePercentageInput(text, percentage))}
                />
                <Slider
                    style={{ flex: 3, marginLeft: 10 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={percentage}
                    onValueChange={(value) => setPercentage(value)}
                    step={1}
                    thumbTintColor="#337010"
                    minimumTrackTintColor="#337010"
                />
            </View>
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground
                source={require('../../assets/images/main_background.png')}
                resizeMode="cover"
                style={globalStyles.imageBackground}
            >
                <View style={initialQuestionsStyles.container}>
                    <ScrollView contentContainerStyle={initialQuestionsStyles.scrollViewContent}>
                        <Text style={initialQuestionsStyles.titleTarget}>
                            {energyUnit === 'kilocalories' ? t('setupTargetCalories') : t('setupTargetKj')}
                        </Text>
                        <TextInput
                            style={[globalStyles.input]}
                            placeholder={energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
                            keyboardType="numeric"
                            value={targetCalories}
                            onChangeText={(text) => setTargetCalories(text)}
                        />
                        {!validateTargetCalories(energyUnit, targetCalories) && (
                            <Text style={{ color: 'red', marginTop: 10 }}>
                                {energyUnit === 'kilocalories' ? t('incorrectCaloriesTarget') : t('incorrectKilojoulesTarget')}
                            </Text>
                        )}
                        {renderMacroSlider(t('protein'), proteinPercentage, setProteinPercentage)}
                        {renderMacroSlider(t('carbs'), carbsPercentage, setCarbsPercentage)}
                        {renderMacroSlider(t('fat'), fatPercentage, setFatPercentage)}
                        <Text style={globalStyles.macroText}>
                            {t('protein')}: {proteinGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
                        </Text>
                        <Text style={globalStyles.macroText}>
                            {t('carbs')}: {carbsGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
                        </Text>
                        <Text style={globalStyles.macroText}>
                            {t('fat')}: {fatGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
                        </Text>
                        {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
                            <Text style={{ color: 'red', marginTop: 10 }}>{t('percentageAlert')}</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleSaveSettings}>
                        <Text style={globalStyles.buttonText}>{t('saveSettings')}</Text>
                    </TouchableOpacity>
                    {loading && (
                        <View style={globalStyles.loadingOverlay}>
                            <TouchableWithoutFeedback>
                                <BlurView intensity={50} style={globalStyles.blurView}>
                                    <ActivityIndicator size="large" color="#388e3c" />
                                </BlurView>
                            </TouchableWithoutFeedback>
                        </View>
                    )}
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default TargetCaloriesAndMacros;
