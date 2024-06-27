import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import { t } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18n';

interface Props {
    navigation: any;
    route: any;
}

const settingsOptions = [
    { key: 'availableFood', screen: 'AvailableIngredientsSettings' },
    { key: 'allergiesIntolerances', screen: 'AllergiesSettings' },
    { key: 'dietType', screen: 'DietSettings' },
    { key: 'equipment', screen: 'EquipmentSettings' },
    { key: 'measurementPreferences', screen: 'MeasurementSettings' },
    { key: 'targetEnergyMacros', screen: 'TargetEnergyAndMacros' }
];

const SettingsScreen: React.FC<Props> = ({ route, navigation }) => {

    return (
        <I18nextProvider i18n={i18n}>
            <View style={settingsStyles.container}>
                <ScrollView style={settingsStyles.scrollContainer}>
                    {settingsOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={settingsStyles.option}
                            onPress={() => navigation.navigate(option.screen)}
                        >
                            <Text style={settingsStyles.optionText}>{t(`settings.${option.key}`)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <Footer navigation={navigation} />
            </View>
        </I18nextProvider>
    );
};

export default SettingsScreen;
