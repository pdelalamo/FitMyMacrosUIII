import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const MeasurementPreferences: React.FC<Props> = ({ navigation }) => {
    const { setMeasurementPreference } = useUserPreferences();
    const [weightPreference, setWeightPreference] = useState<string | null>(null);
    const [fluidPreference, setFluidPreference] = useState<string | null>(null);
    const [energyPreference, setEnergyPreference] = useState<string | null>(null);
    const { t } = useTranslation();

    const weightOptions: string[] = t('weightOptions', { returnObjects: true });
    const fluidOptions: string[] = t('fluidOptions', { returnObjects: true });
    const energyOptions: string[] = t('energyOptions', { returnObjects: true });

    const handleSelectWeightPreference = (preference: string) => {
        AsyncStorage.setItem("measurementSolid", preference);
        setWeightPreference(preference);
    };

    const handleSelectFluidPreference = (preference: string) => {
        AsyncStorage.setItem("measurementFluid", preference);
        setFluidPreference(preference);
    };

    const handleSelectEnergyPreference = (preference: string) => {
        AsyncStorage.setItem("measurementEnergy", preference);
        setEnergyPreference(preference);
    };

    const handleContinue = () => {
        if (weightPreference && fluidPreference && energyPreference) {
            setMeasurementPreference('weight', weightPreference);
            setMeasurementPreference('fluids', fluidPreference);
            setMeasurementPreference('energy', energyPreference);
            navigation.navigate('AvailableIngredients');
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
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.titleIngredients}>{t('selectWeight')}</Text>
                    {weightOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={weightPreference === option ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                            onPress={() => handleSelectWeightPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={initialQuestionsStyles.titleMeasurement}>{t('selectFluid')}</Text>
                    {fluidOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={fluidPreference === option ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                            onPress={() => handleSelectFluidPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={initialQuestionsStyles.titleMeasurement}>{t('selectEnergy')}</Text>
                    {energyOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={energyPreference === option ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                            onPress={() => handleSelectEnergyPreference(option)}
                        >
                            <Text style={globalStyles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={globalStyles.buttonGreenMarginTop} onPress={handleContinue}>
                        <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default MeasurementPreferences;
