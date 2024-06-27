import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TextInput, ScrollView, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsStyles } from './settingsStyles';
import Footer from 'utils/Footer';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { BlurView } from 'expo-blur';

const ingredientsByType: { [key: string]: string[] } = t('ingredientsByType', { returnObjects: true });

const fruitsList = [
    "Apple", "Banana", "Orange", "Peach", "Kiwi", "Pear", "Cherry", "Plum", "Apricot", "Papaya", "Avocado",
    "Grapefruit", "Lemon", "Lime", "Tangerine", "Cantaloupe", "Honeydew melon", "Nectarine", "Persimmon",
    "Dragon fruit", "Jackfruit", "Star fruit", "Ackee", "Plantain", "Coconut", "Mangosteen", "Feijoa",
    "Kumquat", "Pummelo", "Satsuma", "Ugli fruit"
];

interface Props {
    navigation: any;
}

const AvailableIngredientsSettings: React.FC<Props> = ({ navigation }) => {
    const { addIngredientToMap } = useUserPreferences();
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: string }>({});
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { preferences } = useUserPreferences();
    const { measurementPreferences } = preferences;

    useEffect(() => {
        const loadIngredientsMap = async () => {
            try {
                const savedMap = await AsyncStorage.getItem('ingredientsMap');
                if (savedMap) {
                    const parsedObject = JSON.parse(savedMap);
                    setSelectedIngredients(parsedObject);
                }
            } catch (error) {
                console.error('Failed to load ingredients map from AsyncStorage', error);
            }
        };

        loadIngredientsMap();
    }, []);

    const handleSelectIngredient = (ingredient: string, quantity: string) => {
        setSelectedIngredients(prevState => ({ ...prevState, [ingredient]: quantity }));
    };

    const handleToggleCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const handleContinue = async () => {
        if (Object.keys(selectedIngredients).length === 0) {
            let toast = Toast.show(t('ingredientsAlert'), {
                duration: Toast.durations.LONG,
            });
            try {
                await AsyncStorage.setItem('ingredientsMap', JSON.stringify({}));
                await FitMyMacrosApiService.sendUserData();
            } catch (error) {
                console.error('Error saving empty ingredients map to AsyncStorage:', error);
            }

            return;
        }

        Object.entries(selectedIngredients).forEach(([ingredient, quantity]) => {
            addIngredientToMap(ingredient, quantity);
        });

        await AsyncStorage.setItem('ingredientsMap', JSON.stringify(selectedIngredients));
        setLoading(true);
        await FitMyMacrosApiService.sendUserData();
        setLoading(false);
        navigation.navigate('SettingsScreen');
    };

    const getPlaceholder = (category: string, ingredient: string) => {
        if (category === 'Oils') {
            return measurementPreferences.fluids || 'ml';
        } else if (category === 'Fruits' && fruitsList.includes(ingredient)) {
            return t('units');
        } else {
            return measurementPreferences.weight || 'g';
        }
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={settingsStyles.containerSettings}>
                    <Text style={settingsStyles.titleIngredients}>{t('selectIngredients')}</Text>
                    <ScrollView contentContainerStyle={settingsStyles.scrollViewContent}>
                        {Object.entries(ingredientsByType).map(([category, ingredients]) => (
                            <View key={category} style={settingsStyles.scroll}>
                                <TouchableOpacity onPress={() => handleToggleCategory(category)}>
                                    <View style={settingsStyles.categoryTitleContainer}>
                                        <Text style={settingsStyles.categoryTitle}>{t(category)}</Text>
                                        <Ionicons
                                            name={expandedCategory === category ? 'arrow-up' : 'arrow-down'}
                                            size={20}
                                            color="black"
                                            style={settingsStyles.arrowIcon}
                                        />
                                    </View>
                                </TouchableOpacity>
                                {expandedCategory === category && (
                                    <View>
                                        {ingredients.map((ingredient) => (
                                            <View key={ingredient} style={settingsStyles.ingredientRow}>
                                                <Text style={settingsStyles.ingredientText}>{ingredient}</Text>
                                                <TextInput
                                                    style={settingsStyles.quantityInput}
                                                    keyboardType="numeric"
                                                    placeholder={getPlaceholder(category, ingredient)}
                                                    value={selectedIngredients[ingredient] || ''}
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

export default AvailableIngredientsSettings;
