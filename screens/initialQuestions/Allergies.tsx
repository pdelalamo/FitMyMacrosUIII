import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';

interface Props {
    navigation: any;
}

const Allergies: React.FC<Props> = ({ navigation }) => {
    const { addAllergy, removeAllergy } = useUserPreferences();
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const allergyOptions: string[] = t('allergyOptions', { returnObjects: true });

    const toggleAllergySelection = (allergy: string) => {
        setSelectedAllergies(prevSelectedAllergies => 
            prevSelectedAllergies.includes(allergy) 
                ? prevSelectedAllergies.filter(a => a !== allergy)
                : [...prevSelectedAllergies, allergy]
        );
        selectedAllergies.includes(allergy) ? removeAllergy(allergy) : addAllergy(allergy);
    };

    const renderAllergyButton = (allergy: string) => (
        <TouchableOpacity 
            key={allergy}
            style={selectedAllergies.includes(allergy) ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
            onPress={() => toggleAllergySelection(allergy)}
        >
            <Text style={globalStyles.buttonText}>{allergy}</Text>
        </TouchableOpacity>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground 
                source={require('../../assets/images/main_background.png')} 
                resizeMode="cover" 
                style={globalStyles.imageBackground}
            >
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.title}>{t('anyAllergies')}</Text>
                    {allergyOptions.map(renderAllergyButton)}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity 
                            style={globalStyles.buttonGreen} 
                            onPress={() => navigation.navigate('MeasurementPreferences')}
                        >
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default Allergies;
