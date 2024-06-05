import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const GeneratedRecipesList: React.FC<Props> = ({ navigation }) => {
    const [recipes, setRecipes] = useState<string | null>(null);

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const storedRecipes = await AsyncStorage.getItem('recipesList');
                console.log('recipes from async storage: ', storedRecipes);
                setRecipes(storedRecipes);
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
                    <Text>Loading...</Text>
                </View>
            </I18nextProvider>
        );
    }

    let parsedRecipes: string[] = [];
    try {
        parsedRecipes = JSON.parse(recipes);
    } catch (error) {
        console.error('Error parsing recipes', error);
    }

    const renderItem = ({ item }: { item: string }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.recipeName}>{item}</Text>
            <Image
                style={styles.recipeImage}
            />
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMainGeneration}>
                <FlatList
                    data={parsedRecipes}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </I18nextProvider>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    recipeName: {
        fontSize: 16,
        marginRight: 10
    },
    recipeImage: {
        width: 100,
        height: 100,
        borderRadius: 10
    }
});

export default GeneratedRecipesList;
