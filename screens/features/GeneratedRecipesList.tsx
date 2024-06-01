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

    const [recipes, setRecipes] = useState('');

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const recipes = await AsyncStorage.getItem('recipesList');
                setRecipes(recipes !== null ? recipes : '');
            } catch (error) {
                console.error('Error loading username', error);
            }
        };

        loadDailyMeals();
    }, []);

    const parsedRecipes: string[] = JSON.parse(recipes);

    const renderItem = ({ item }: { item: string }) => ( // Explicitly type the item parameter
        <View style={styles.itemContainer}>
            <Text style={styles.recipeName}>{item}</Text>
            {/* Placeholder image, replace with actual images */}
            <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
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