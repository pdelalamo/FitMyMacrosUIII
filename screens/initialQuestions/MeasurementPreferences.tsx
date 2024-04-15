import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ToastAndroid } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import Toast from 'react-native-root-toast';

interface Props {
    navigation: any;
}

const MeasurementPreferences: React.FC<Props> = ({ navigation }) => {
    const { setMeasurementPreference } = useUserPreferences();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPreference, setSelectedPreference] = useState<string | null>(null);
    const { t } = useTranslation();

    const measurementCategories: { [key: string]: string[] } = t('measurementCategories', { returnObjects: true });

    const handleSelectCategory = (category: string) => {
        // Prevent collapsing of a category once it's expanded
        setSelectedCategory(category === selectedCategory ? null : category);
        setSelectedPreference(null);
    };

    const handleSelectPreference = (preference: string) => {
        setSelectedPreference(preference);
    };

    const handleContinue = () => {
        if (!selectedCategory || !selectedPreference) {
            // Show toast if either weight or fluid category is not filled
            let toast = Toast.show('Please select both weight and fluid preferences before continuing', {
                duration: Toast.durations.LONG,
            });
            return;
        }

        setMeasurementPreference(selectedCategory === 'weight' ? 'weight' : 'fluids', selectedPreference);
        navigation.navigate('AvailableIngredients');
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.title}>{t('selectMeasurementCategory')}</Text>
                    {Object.entries(measurementCategories).map(([category, preferences]) => (
                        <View key={category}>
                            <TouchableOpacity
                                style={globalStyles.buttonGrey}
                                onPress={() => handleSelectCategory(category)}
                            >
                                <Text style={globalStyles.buttonText}>{t(category)}</Text>
                            </TouchableOpacity>
                            {selectedCategory === category &&
                                preferences.map((preference) => (
                                    <TouchableOpacity
                                        key={preference}
                                        style={selectedPreference === preference ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                                        onPress={() => handleSelectPreference(preference)}
                                    >
                                        <Text style={globalStyles.buttonText}>{preference}</Text>
                                    </TouchableOpacity>
                                ))}
                        </View>
                    ))}
                    <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleContinue}>
                        <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default MeasurementPreferences;
