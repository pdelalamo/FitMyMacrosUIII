import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import { BlurView } from 'expo-blur';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';

interface Props {
    navigation: any;
}

const MeasurementSettings: React.FC<Props> = ({ navigation }) => {
    const { setMeasurementPreference } = useUserPreferences();
    const [weightPreference, setWeightPreference] = useState<string | null>(null);
    const [fluidPreference, setFluidPreference] = useState<string | null>(null);
    const [energyPreference, setEnergyPreference] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();

    const weightOptions: string[] = t('weightOptions', { returnObjects: true });
    const fluidOptions: string[] = t('fluidOptions', { returnObjects: true });
    const energyOptions: string[] = t('energyOptions', { returnObjects: true });

    // Load preferences from AsyncStorage when the component mounts
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const energy = await AsyncStorage.getItem('measurementEnergy');
                const weight = await AsyncStorage.getItem('measurementSolid');
                const fluid = await AsyncStorage.getItem('measurementFluid');
                if (energy) setEnergyPreference(energy);
                if (weight) setWeightPreference(weight);
                if (fluid) setFluidPreference(fluid);
            } catch (error) {
                console.error('Failed to load measurement preferences from AsyncStorage', error);
            }
        };

        loadPreferences();
    }, []);

    const handleSelectWeightPreference = async (preference: string) => {
        try {
            await AsyncStorage.setItem("measurementSolid", preference);
            setWeightPreference(preference);
        } catch (error) {
            console.error('Error saving weight preference to AsyncStorage', error);
        }
    };

    const handleSelectFluidPreference = async (preference: string) => {
        try {
            await AsyncStorage.setItem("measurementFluid", preference);
            setFluidPreference(preference);
        } catch (error) {
            console.error('Error saving fluid preference to AsyncStorage', error);
        }
    };

    const handleSelectEnergyPreference = async (preference: string) => {
        try {
            await AsyncStorage.setItem("measurementEnergy", preference);
            setEnergyPreference(preference);
        } catch (error) {
            console.error('Error saving energy preference to AsyncStorage', error);
        }
    };

    const handleContinue = async () => {
        if (weightPreference && fluidPreference && energyPreference) {
            setMeasurementPreference('weight', weightPreference);
            setMeasurementPreference('fluids', fluidPreference);
            setMeasurementPreference('energy', energyPreference);
            setLoading(true);
            await FitMyMacrosApiService.sendUserData();
            setLoading(false);
            navigation.navigate('SettingsScreen');
        } else {
            let toast = Toast.show(t('measurementAlert'), {
                duration: Toast.durations.LONG,
            });
            return;
        }
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={settingsStyles.containerSettings}>
                    <Text style={settingsStyles.titleIngredients}>{t('selectWeight')}</Text>
                    {weightOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={weightPreference === option ? settingsStyles.selectedButton : settingsStyles.button}
                            onPress={() => handleSelectWeightPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={settingsStyles.titleMeasurement}>{t('selectFluid')}</Text>
                    {fluidOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={fluidPreference === option ? settingsStyles.selectedButton : settingsStyles.button}
                            onPress={() => handleSelectFluidPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={settingsStyles.titleMeasurement}>{t('selectEnergy')}</Text>
                    {energyOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={energyPreference === option ? settingsStyles.selectedButton : settingsStyles.button}
                            onPress={() => handleSelectEnergyPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={globalStyles.buttonGreenMarginTop} onPress={handleContinue}>
                        <Text style={globalStyles.buttonText}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            {loading && (
                <View style={settingsStyles.loadingOverlay}>
                    <TouchableWithoutFeedback>
                        <BlurView intensity={50} style={settingsStyles.blurView}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </BlurView>
                    </TouchableWithoutFeedback>
                </View>
            )}
            <Footer navigation={navigation} />
        </I18nextProvider>
    );
};

export default MeasurementSettings;