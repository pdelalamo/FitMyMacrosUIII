import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { UserPreferencesProvider, useUserPreferences } from '../../context/UserPreferencesContext';
import Toast from 'react-native-root-toast';

const dietOptions = ['Omnivore', 'Carnivore', 'Vegan', 'Keto', 'Vegetarian', 'Paleo', 'PescoPollo'];


interface Props {
    navigation: any;
}

const ChooseDiet: React.FC<Props> = ({ navigation }) => {
    //usage of the context. Basically allows to update the diet type in the context when calling the setDietType function
    const { setDietType } = useUserPreferences();
    //initializes selectedDiet to null, and then updates it with each setSelectedDiet call 
    const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

    const handleSelectDiet = (diet: string) => {
        setSelectedDiet(diet);
        setDietType(diet);
    };

    const handleContinue = () => {
        if (!selectedDiet) {
            let toast = Toast.show('Please select a diet before continuing', {
                duration: Toast.durations.LONG,
            });
            return;
        }
        navigation.navigate('NextScreen');
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
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleContinue}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default ChooseDiet;
