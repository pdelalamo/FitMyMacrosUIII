import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground, TextInput, ScrollView } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';

const ingredientsByType: { [key: string]: string[] } = t('ingredientsByType', { returnObjects: true });

interface Props {
    navigation: any;
}

const AvailableIngredients: React.FC<Props> = ({ navigation }) => {
    const { addIngredientToMap } = useUserPreferences();
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: string }>({});
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const handleSelectIngredient = (ingredient: string, quantity: string) => {
        setSelectedIngredients({ ...selectedIngredients, [ingredient]: quantity });
    };

    const handleToggleCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const handleContinue = () => {
        if (Object.keys(selectedIngredients).length === 0) {
            return;
        }

        Object.entries(selectedIngredients).forEach(([ingredient, quantity]) => {
            addIngredientToMap(ingredient, quantity);
        });

        navigation.navigate('NextScreen');
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <ScrollView contentContainerStyle={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.title}>{t('selectIngredients')}</Text>
                    {Object.entries(ingredientsByType).map(([category, ingredients]) => (
                        <View key={category}>
                            <TouchableOpacity onPress={() => handleToggleCategory(category)}>
                                <Text style={initialQuestionsStyles.categoryTitle}>{t(category)}</Text>
                            </TouchableOpacity>
                            {expandedCategory === category &&
                                ingredients.map((ingredient) => (
                                    <View key={ingredient} style={initialQuestionsStyles.ingredientRow}>
                                        <Text style={initialQuestionsStyles.ingredientText}>{ingredient}</Text>
                                        <TextInput
                                            style={initialQuestionsStyles.quantityInput}
                                            keyboardType="numeric"
                                            placeholder={t('quantity')}
                                            onChangeText={(quantity) => handleSelectIngredient(ingredient, quantity)}
                                        />
                                    </View>
                                ))}
                        </View>
                    ))}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleContinue}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default AvailableIngredients;
