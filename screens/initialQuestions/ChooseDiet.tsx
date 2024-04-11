import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
const dietOptions = ['Omnivore', 'Carnivore', 'Vegan', 'Keto', 'Vegetarian', 'Paleo', 'PescoPollo'];

interface Props {
    navigation: any;
}

const ChooseDiet: React.FC<Props> = ({ navigation }) => {
    const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

    const handleSelectDiet = (diet: string) => {
        setSelectedDiet(diet);
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.title}>{t('chooseDiet')}</Text>
                    {dietOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet}
                            style={selectedDiet === diet ? initialQuestionsStyles.selectedButton : initialQuestionsStyles.button}
                            onPress={() => handleSelectDiet(diet)}
                        >
                            <Text style={globalStyles.buttonText}>{diet}</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('ChooseDiet')}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default ChooseDiet;
