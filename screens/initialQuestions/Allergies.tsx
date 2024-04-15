import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';

const allergyOptions: string[] = t('allergyOptions', { returnObjects: true });

interface Props {
    navigation: any;
}

const Allergies: React.FC<Props> = ({ navigation }) => {
    // Usage of the context to access the user preferences and update the allergies list
    const { addAllergy, removeAllergy } = useUserPreferences();

    // Initialize selectedAllergies to an empty array
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

    const handleSelectAllergy = (allergy: string) => {
        if (selectedAllergies.includes(allergy)) {
            setSelectedAllergies(prev => prev.filter(a => a !== allergy));
            removeAllergy(allergy);
        } else {
            setSelectedAllergies(prev => [...prev, allergy]);
            addAllergy(allergy);
        }
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.title}>{t('anyAllergies')}</Text>
                    {allergyOptions.map((allergy) => (
                        <TouchableOpacity
                            key={allergy}
                            style={selectedAllergies.includes(allergy) ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                            onPress={() => handleSelectAllergy(allergy)}
                        >
                            <Text style={globalStyles.buttonText}>{allergy}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('MeasurementPreferences')}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default Allergies;
