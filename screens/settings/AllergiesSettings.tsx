import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import { BlurView } from 'expo-blur';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const AllergiesSettings: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const allergyOptions: string[] = t('allergyOptions', { returnObjects: true });

    const [loading, setLoading] = useState(false);
    const { addAllergy, removeAllergy } = useUserPreferences();
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

    // Load allergies from AsyncStorage when the component mounts
    useEffect(() => {
        const loadAllergies = async () => {
            try {
                const storedAllergies = await AsyncStorage.getItem('allergiesList');
                if (storedAllergies) {
                    const allergiesArray = JSON.parse(storedAllergies);
                    setSelectedAllergies(allergiesArray);
                }
            } catch (error) {
                console.error('Failed to load allergies from AsyncStorage', error);
            }
        };

        loadAllergies();
    }, []);

    const handleSelectAllergy = (allergy: string) => {
        if (selectedAllergies.includes(allergy)) {
            setSelectedAllergies(prev => prev.filter(a => a !== allergy));
            removeAllergy(allergy);
        } else {
            setSelectedAllergies(prev => [...prev, allergy]);
            addAllergy(allergy);
        }
    };

    const handleContinue = async () => {
        setLoading(true);
        await FitMyMacrosApiService.sendUserData();
        // Save selected allergies to AsyncStorage
        try {
            await AsyncStorage.setItem('allergiesList', JSON.stringify(selectedAllergies));
        } catch (error) {
            console.error('Failed to save allergies to AsyncStorage', error);
        }
        setLoading(false);
        navigation.navigate('SettingsScreen');
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={settingsStyles.containerSettings}>
                    <Text style={settingsStyles.title}>{t('anyAllergies')}</Text>
                    {allergyOptions.map((allergy) => (
                        <TouchableOpacity
                            key={allergy}
                            style={selectedAllergies.includes(allergy) ? settingsStyles.selectedButton : settingsStyles.button}
                            onPress={() => handleSelectAllergy(allergy)}
                        >
                            <Text style={globalStyles.buttonText}>{allergy}</Text>
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

export default AllergiesSettings;