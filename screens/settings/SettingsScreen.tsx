import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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
    // Function to handle log out confirmation and navigation
    const handleLogout = () => {
        Alert.alert(
            t('logoutConfirmationTitle'),
            t('logoutConfirmationMessage'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('confirm'),
                    onPress: () => {
                        // Navigate to HomeScreen
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'HomeScreen' }],
                        });
                    },
                    style: 'destructive', // Optional: makes the button text red on iOS
                },
            ],
            { cancelable: false } // Makes sure the alert cannot be dismissed by clicking outside
        );
    };

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

                {/* Log Out Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>{t('logOut')}</Text>
                </TouchableOpacity>

                <Footer navigation={navigation} />
            </View>
        </I18nextProvider>
    );
};

const styles = StyleSheet.create({
    logoutButton: {
        marginTop: 20,
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    logoutButtonText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;