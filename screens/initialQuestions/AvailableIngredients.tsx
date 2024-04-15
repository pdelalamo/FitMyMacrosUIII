import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground, TextInput, ScrollView } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Ionicons } from '@expo/vector-icons';

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
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.titleIngredients}>{t('selectIngredients')}</Text>
                    <ScrollView contentContainerStyle={initialQuestionsStyles.scrollViewContent}>
                        {Object.entries(ingredientsByType).map(([category, ingredients]) => (
                            <View key={category} style={initialQuestionsStyles.scroll}>
                                <TouchableOpacity onPress={() => handleToggleCategory(category)}>
                                    <View style={initialQuestionsStyles.categoryTitleContainer}>
                                        <Text style={initialQuestionsStyles.categoryTitle}>{t(category)}</Text>
                                        <Ionicons
                                            name={expandedCategory === category ? 'arrow-up' : 'arrow-down'}
                                            size={20}
                                            color="black"
                                            style={initialQuestionsStyles.arrowIcon}
                                        />
                                    </View>
                                </TouchableOpacity>
                                {expandedCategory === category && (
                                    <View>
                                        {ingredients.map((ingredient) => (
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
                                )}
                            </View>
                        ))}
                    </ScrollView>
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

export default AvailableIngredients;
