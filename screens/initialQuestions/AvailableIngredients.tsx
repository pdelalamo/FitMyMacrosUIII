import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TextInput, ScrollView } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ingredientsByType: { [key: string]: string[] } = t('ingredientsByType', { returnObjects: true });

const FRUITS_LIST = [
    "Apple", "Banana", "Orange", "Peach", "Kiwi", "Pear", "Cherry", "Plum", "Apricot", "Papaya", "Avocado",
    "Grapefruit", "Lemon", "Lime", "Tangerine", "Cantaloupe", "Honeydew melon", "Nectarine", "Persimmon",
    "Dragon fruit", "Jackfruit", "Star fruit", "Ackee", "Plantain", "Coconut", "Mangosteen", "Feijoa",
    "Kumquat", "Pummelo", "Satsuma", "Ugli fruit"
];

interface Props {
    navigation: any;
}

const AvailableIngredients: React.FC<Props> = ({ navigation }) => {
    const { addIngredientToMap, preferences } = useUserPreferences();
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: string }>({});
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const handleSelectIngredient = (ingredient: string, quantity: string) => {
        setSelectedIngredients(prev => ({ ...prev, [ingredient]: quantity }));
    };

    const handleToggleCategory = (category: string) => {
        setExpandedCategory(prevCategory => (prevCategory === category ? null : category));
    };

    const handleContinue = async () => {
        if (Object.keys(selectedIngredients).length === 0) {
            showToastMessage(t('ingredientsAlert'));
            await saveIngredientsMap({});
            return;
        }

        Object.entries(selectedIngredients).forEach(([ingredient, quantity]) => {
            addIngredientToMap(ingredient, quantity);
        });
        await saveIngredientsMap(selectedIngredients);
        navigation.navigate('Equipment');
    };

    const saveIngredientsMap = async (map: object) => {
        try {
            await AsyncStorage.setItem('ingredientsMap', JSON.stringify(map));
        } catch (error) {
            console.error('Error saving ingredients map to AsyncStorage:', error);
        }
    };

    const showToastMessage = (message: string) => {
        Toast.show(message, { duration: Toast.durations.LONG });
    };

    const getPlaceholder = (category: string, ingredient: string) => {
        if (category === 'Oils') {
            return preferences.measurementPreferences.fluids || 'ml';
        } else if (category === 'Fruits' && FRUITS_LIST.includes(ingredient)) {
            return t('units');
        } else {
            return preferences.measurementPreferences.weight || 'g';
        }
    };

    const renderIngredientRow = (ingredient: string, category: string) => (
        <View key={ingredient} style={initialQuestionsStyles.ingredientRow}>
            <Text style={initialQuestionsStyles.ingredientText}>{ingredient}</Text>
            <TextInput
                style={initialQuestionsStyles.quantityInput}
                keyboardType="numeric"
                placeholder={getPlaceholder(category, ingredient)}
                value={selectedIngredients[ingredient] || ''}
                onChangeText={(quantity) => handleSelectIngredient(ingredient, quantity)}
            />
        </View>
    );

    const renderCategory = ([category, ingredients]: [string, string[]]) => (
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
            {expandedCategory === category && ingredients.map(ingredient => renderIngredientRow(ingredient, category))}
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground
                source={require('../../assets/images/main_background.png')}
                resizeMode="cover"
                style={globalStyles.imageBackground}
            >
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.titleIngredients}>{t('selectIngredients')}</Text>
                    <ScrollView contentContainerStyle={initialQuestionsStyles.scrollViewContent}>
                        {Object.entries(ingredientsByType).map(renderCategory)}
                    </ScrollView>
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleContinue}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.buttonGrey} onPress={() => navigation.navigate('Equipment')}>
                            <Text style={globalStyles.buttonText}>{t('skip')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default AvailableIngredients;
