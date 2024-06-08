import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';

interface Props {
    navigation: any;
    route: any;
}

const RecipeDetail: React.FC<Props> = ({ route, navigation }) => {
    const { recipeData } = route.params;

    // Debugging: Log the incoming recipeData
    console.log('Received recipeData:', recipeData);

    // Parse the JSON safely
    let parsedData;
    try {
        parsedData = JSON.parse(recipeData);
    } catch (error) {
        console.error('Failed to parse recipeData:', error);
        return (
            <View style={globalStyles.containerMainGeneration}>
                <Text>Error loading recipe details.</Text>
            </View>
        );
    }

    const {
        recipeName,
        cookingTime,
        caloriesAndMacros,
        ingredientsAndQuantities,
        cookingProcess
    } = parsedData;

    const ingredients: [string, string][] = Object.entries(ingredientsAndQuantities).map(
        ([key, value]) => [key, value as string]
    );

    const renderIngredient = ({ item }: { item: [string, string] }) => (
        <View style={styles.ingredientContainer}>
            <Text style={styles.ingredientName}>{item[0]}</Text>
            <Text style={styles.ingredientQuantity}>{item[1]}</Text>
        </View>
    );

    const renderStep = ({ item }: { item: string }) => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepText}>{item}</Text>
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <ScrollView style={globalStyles.containerMainGeneration}>
                <View style={styles.headerContainer}>
                    <Text style={styles.recipeName}>{recipeName}</Text>
                    <Text style={styles.cookingTime}>{cookingTime}</Text>
                </View>
                <View style={styles.macrosContainer}>
                    <Text style={styles.macrosText}>Calories: {caloriesAndMacros.calories}</Text>
                    <Text style={styles.macrosText}>Protein: {caloriesAndMacros.protein}</Text>
                    <Text style={styles.macrosText}>Carbs: {caloriesAndMacros.carbs}</Text>
                    <Text style={styles.macrosText}>Fat: {caloriesAndMacros.fat}</Text>
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    <FlatList
                        data={ingredients}
                        renderItem={renderIngredient}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Cooking Process</Text>
                    <FlatList
                        data={cookingProcess}
                        renderItem={renderStep}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Back to Recipes</Text>
                </TouchableOpacity>
            </ScrollView>
        </I18nextProvider>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    recipeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    cookingTime: {
        fontSize: 16,
        color: '#777',
        marginVertical: 10,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    macrosText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    sectionContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
    },
    ingredientContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    ingredientName: {
        fontSize: 16,
        color: '#333',
    },
    ingredientQuantity: {
        fontSize: 16,
        color: '#666',
    },
    stepContainer: {
        marginVertical: 5,
    },
    stepText: {
        fontSize: 16,
        color: '#333',
    },
    backButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RecipeDetail;