import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    navigation: any;
}

const GeneratedRecipesList: React.FC<Props> = ({ navigation }) => {
    const [recipes, setRecipes] = useState<{ [key: string]: string } | null>(null);
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const storedRecipes = await AsyncStorage.getItem('recipesList');
                console.log('recipes from async storage: ', storedRecipes);
                setRecipes(storedRecipes ? JSON.parse(storedRecipes) : {});
            } catch (error) {
                console.error('Error loading recipes', error);
            }
        };

        loadDailyMeals();
    }, []);

    if (recipes === null) {
        return (
            <I18nextProvider i18n={i18n}>
                <View style={globalStyles.containerMainGeneration}>
                    <Text>{t('loading')}</Text>
                </View>
            </I18nextProvider>
        );
    }

    const handleGenerateRecipe = (recipeName: string) => {
        navigation.navigate('RecipeDetails');
    };

    const renderItem = ({ item }: { item: [string, string] }) => {
        const [recipeName, recipeDescription] = item;

        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => setExpandedRecipe(expandedRecipe === recipeName ? null : recipeName)}>
                    <Text style={styles.recipeName}>{recipeName}</Text>
                </TouchableOpacity>
                {expandedRecipe === recipeName && (
                    <>
                        <Text style={styles.recipeDescription}>{recipeDescription}</Text>
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={() => handleGenerateRecipe(recipeName)}
                        >
                            <Text style={styles.buttonText}>{t('generateRecipe')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };


    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMainGeneration}>
                <View style={styles.titleContainer}>
                    <Ionicons name="fast-food-outline" size={24} />
                    <Text style={styles.screenTitle}>{t('selectRecipe')}</Text>
                </View>
                <FlatList
                    data={Object.entries(recipes)}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </I18nextProvider>
    );

};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        minHeight: 120,
        justifyContent: 'center',
    },
    recipeName: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    recipeDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    generateButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    listContent: {
        paddingBottom: 100,
    },
});

export default GeneratedRecipesList;
