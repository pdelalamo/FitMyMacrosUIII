import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';
import SecurityApiService from 'services/SecurityApiService';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { generateRandomString, removeLeadingTrailingCommasAndQuotes } from 'utils/UtilFunctions';
import { BlurView } from 'expo-blur';

interface Props {
    navigation: any;
    route: any;
}

const GeneratedRecipesList: React.FC<Props> = ({ navigation, route }) => {
    const [recipes, setRecipes] = useState<{ [key: string]: string } | null>(null);
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
    const [opId, setOpId] = useState('');
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        measureUnit,
        calories,
        protein,
        carbs,
        fat,
        anyIngredientsMode,
        glutenFree,
        vegan,
        vegetarian,
        cookingTime,
        userId,
        precision,
        recipeName
    } = route.params;

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
        const loadPreferences = async () => {
            try {
                setUsername(await AsyncStorage.getItem('username'));
            } catch (error) {
                console.error('Error loading preferences', error);
            }
        };
        loadDailyMeals();
        loadPreferences();
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

    const handleGenerateRecipe = async (recipeName: string) => {
        setLoading(true);
        const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
        const token = tokenResponse.body;
        console.log('token: ' + token);

        FitMyMacrosApiService.setAuthToken(token);
        //FitMyMacrosApiService.setAsyncInvocationMode(true);
        setOpId(generateRandomString(20));
        const recipeDetail = await apiCallWithRetry({
            measureUnit,
            calories,
            protein,
            carbs,
            fat,
            anyIngredientsMode,
            glutenFree,
            vegan,
            vegetarian,
            cookingTime,
            userId,
            precision,
            opId,
            recipeName
        });
        console.log('recipe detail from openAI: ' + removeLeadingTrailingCommasAndQuotes(recipeDetail.body));
        setLoading(false);
        navigation.navigate('RecipeDetail', { recipeData: removeLeadingTrailingCommasAndQuotes(recipeDetail.body), anyIngredientsMode: anyIngredientsMode });
    };

    const apiCallWithRetry = async (params: Record<string, any>, maxRetries = 3, timeout = 30000): Promise<any> => {
        const makeApiCall = () => FitMyMacrosApiService.getRecipeDetail(params);

        const callWithTimeout = () => {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, timeout);

                makeApiCall()
                    .then((response) => {
                        clearTimeout(timer);
                        resolve(response);
                    })
                    .catch((error) => {
                        clearTimeout(timer);
                        reject(error);
                    });
            });
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await callWithTimeout();
                return response; // Successful response, return it
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    throw new Error('All attempts to fetch recipe data');
                }
            }
        }
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
                {loading && (
                    <View style={globalStyles.loadingOverlay}>
                        <TouchableWithoutFeedback>
                            <BlurView intensity={50} style={globalStyles.blurView}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </BlurView>
                        </TouchableWithoutFeedback>
                    </View>
                )}
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

