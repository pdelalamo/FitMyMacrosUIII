import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import { featuresStyles } from './featuresStyles';
import SecurityApiService from 'services/SecurityApiService';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { generateRandomString, removeLeadingTrailingCommasAndQuotes } from 'utils/UtilFunctions';

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
    const fetchData = async () => {
      await loadStoredRecipes();
      await loadUserPreferences();
    };
    fetchData();
  }, []);

  const loadStoredRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem('recipesList');
      setRecipes(storedRecipes ? JSON.parse(storedRecipes) : {});
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleGenerateRecipe = async (recipeName: string) => {
    setLoading(true);
    try {
      const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
      const token = tokenResponse.body;

      FitMyMacrosApiService.setAuthToken(token);
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

      navigation.navigate('RecipeDetail', {
        recipeData: removeLeadingTrailingCommasAndQuotes(recipeDetail.body),
        anyIngredientsMode: anyIngredientsMode
      });
    } catch (error) {
      console.error('Error generating recipe detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const apiCallWithRetry = async (params: Record<string, any>, maxRetries = 3, timeout = 30000): Promise<any> => {
    const attemptApiCall = () => FitMyMacrosApiService.getRecipeDetail(params);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callWithTimeout(attemptApiCall, timeout);
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw new Error('All attempts to fetch recipe data failed.');
        }
      }
    }
  };

  const callWithTimeout = (apiCall: () => Promise<any>, timeout: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Request timed out')), timeout);

      apiCall()
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

  const renderRecipeItem = ({ item }: { item: [string, string] }) => {
    const [recipeName, recipeDescription] = item;

    return (
      <View style={featuresStyles.itemContainer}>
        <TouchableOpacity onPress={() => setExpandedRecipe(expandedRecipe === recipeName ? null : recipeName)}>
          <Text style={featuresStyles.recipeName}>{recipeName}</Text>
        </TouchableOpacity>
        {expandedRecipe === recipeName && (
          <>
            <Text style={featuresStyles.recipeDescription}>{recipeDescription}</Text>
            <TouchableOpacity
              style={featuresStyles.generateButton}
              onPress={() => handleGenerateRecipe(recipeName)}
            >
              <Text style={featuresStyles.buttonText}>{t('generateRecipe')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  if (!recipes) {
    return (
      <I18nextProvider i18n={i18n}>
        <View style={globalStyles.containerMainGeneration}>
          <Text>{t('loading')}</Text>
        </View>
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <View style={globalStyles.containerMainGeneration}>
        <View style={featuresStyles.titleContainer}>
          <Ionicons name="fast-food-outline" size={24} />
          <Text style={featuresStyles.screenTitle}>{t('selectRecipe')}</Text>
        </View>
        <FlatList
          data={Object.entries(recipes)}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={featuresStyles.listContent}
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

export default GeneratedRecipesList;
