import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { t } from 'i18next';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import { BlurView } from 'expo-blur';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const equipmentOptions: string[] = t('equipmentOptions', { returnObjects: true });

interface Props {
    navigation: any;
}

const EquipmentSettings: React.FC<Props> = ({ navigation }) => {
    const { addEquipment, removeEquipment } = useUserPreferences();
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const loadEquipment = async () => {
            try {
                const storedEquipment = await AsyncStorage.getItem('equipmentList');
                if (storedEquipment) {
                    const equipmentArray = JSON.parse(storedEquipment);
                    setSelectedEquipment(equipmentArray);
                }
            } catch (error) {
                console.error('Failed to load equipment from AsyncStorage', error);
            }
        };

        loadEquipment();
    }, []);

    const handleSelectEquipment = (equipment: string) => {
        if (selectedEquipment.includes(equipment)) {
            setSelectedEquipment(prev => prev.filter(item => item !== equipment));
            removeEquipment(equipment);
        } else {
            setSelectedEquipment(prev => [...prev, equipment]);
            addEquipment(equipment);
        }
    };


    const handleContinue = async () => {
        setLoading(true);
        await FitMyMacrosApiService.sendUserData();
        setLoading(false);
        navigation.navigate('SettingsScreen')
    };

    const renderEquipmentButtons = () => {
        const buttons = [];
        for (let i = 0; i < equipmentOptions.length; i += 2) {
            const firstEquipment = equipmentOptions[i];
            const secondEquipment = equipmentOptions[i + 1];
            buttons.push(
                <View style={settingsStyles.rowContainer} key={i}>
                    <TouchableOpacity
                        style={[
                            settingsStyles.buttonSmall,
                            selectedEquipment.includes(firstEquipment) ? settingsStyles.selectedButtonSmall : null,
                        ]}
                        onPress={() => handleSelectEquipment(firstEquipment)}
                    >
                        <Text style={globalStyles.buttonText}>{firstEquipment}</Text>
                    </TouchableOpacity>
                    {secondEquipment && (
                        <TouchableOpacity
                            style={[
                                settingsStyles.buttonSmall,
                                selectedEquipment.includes(secondEquipment) ? settingsStyles.selectedButtonSmall : null,
                            ]}
                            onPress={() => handleSelectEquipment(secondEquipment)}
                        >
                            <Text style={globalStyles.buttonText}>{secondEquipment}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return buttons;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={settingsStyles.containerSettings}>
                    <Text style={settingsStyles.titleEquipment}>{t('selectEquipment')}</Text>
                    {renderEquipmentButtons()}
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

export default EquipmentSettings;
