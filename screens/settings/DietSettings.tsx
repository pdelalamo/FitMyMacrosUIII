import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import Toast from 'react-native-root-toast';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import { BlurView } from 'expo-blur';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const DietSettings: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const dietOptions: string[] = t('dietOptions', { returnObjects: true });

    const { setDietType } = useUserPreferences();
    const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Load diet type from AsyncStorage when the component mounts
    useEffect(() => {
        const loadDietType = async () => {
            try {
                const storedDietType = await AsyncStorage.getItem('dietType');
                if (storedDietType) {
                    setSelectedDiet(storedDietType);
                }
            } catch (error) {
                console.error('Failed to load diet type from AsyncStorage', error);
            }
        };

        loadDietType();
    }, []);

    const handleSelectDiet = (diet: string) => {
        setSelectedDiet(diet);
        setDietType(diet);
    };

    const handleContinue = async () => {
        if (!selectedDiet) {
            let toast = Toast.show(t('dietAlert'), {
                duration: Toast.durations.LONG,
            });
            return;
        }
        setLoading(true);
        await FitMyMacrosApiService.sendUserData();
        // Save selected diet type to AsyncStorage
        try {
            await AsyncStorage.setItem('dietType', selectedDiet);
        } catch (error) {
            console.error('Failed to save diet type to AsyncStorage', error);
        }
        setLoading(false);
        navigation.navigate('SettingsScreen');
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={settingsStyles.containerSettings}>
                    <Text style={settingsStyles.title}>{t('chooseDiet')}</Text>
                    {dietOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet}
                            style={selectedDiet === diet ? settingsStyles.selectedButton : settingsStyles.button}
                            onPress={() => handleSelectDiet(diet)}
                        >
                            <Text style={globalStyles.buttonText}>{diet}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleContinue}>
                            <Text style={globalStyles.buttonText}>{t('save')}</Text>
                        </TouchableOpacity>
                    </View>
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

export default DietSettings;