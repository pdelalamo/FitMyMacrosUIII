import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground, ScrollView } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    navigation: any;
}

const MainScreen: React.FC<Props> = ({ navigation }) => {

    const meals = [
        { id: 1, name: 'Breakfast', calories: 300 },
        { id: 2, name: 'Lunch', calories: 500 },
        { id: 3, name: 'Snack', calories: 150 },
        { id: 4, name: 'Dinner', calories: 600 },
    ];

    const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMain}>
                <View style={globalStyles.header}>
                    <Text style={globalStyles.headerText}>Total Calories: {totalCalories}</Text>
                </View>
                <ScrollView style={globalStyles.mealsContainer}>
                    {meals.map(meal => (
                        <View key={meal.id} style={globalStyles.mealBox}>
                            <Text style={globalStyles.mealName}>{meal.name}</Text>
                            <Text style={globalStyles.mealCalories}>{meal.calories} kcal</Text>
                        </View>
                    ))}
                </ScrollView>
                <TouchableOpacity style={globalStyles.addButton}>
                    <Text style={globalStyles.addButtonText}>Add New Meal</Text>
                </TouchableOpacity>
                <View style={globalStyles.footer}>
                    <Ionicons name="home" size={24} color="white" />
                    <Ionicons name="search" size={24} color="white" />
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Ionicons name="notifications" size={24} color="white" />
                    <Ionicons name="person" size={24} color="white" />
                </View>
            </View>
        </I18nextProvider>
    );
};

export default MainScreen;
