import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
const schedule = require('node-schedule');

// Function to save meals to AsyncStorage
const saveMeals = async (meals: any) => {
    try {
        await AsyncStorage.setItem('meals', JSON.stringify(meals));
    } catch (error) {
        console.error('Error saving meals:', error);
    }
};

const checkAndClearMeals = async () => {
    try {
        const lastOpenedDateStr = await AsyncStorage.getItem('lastOpenedDate');
        const currentDate = new Date().toISOString().split('T')[0];

        if (lastOpenedDateStr !== currentDate) {
            await clearMeals();
            await AsyncStorage.setItem('lastOpenedDate', currentDate);
        }
    } catch (error) {
        console.error('Error checking and clearing meals:', error);
    }
};

/**
 * This batch job clears the meals of the day at midnight
 */
const clearMealsAtMidnight = () => {
    // Create a rule for midnight (00:00)
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;

    // Schedule the job
    schedule.scheduleJob(rule, clearMeals);
};

const clearMeals = async () => {
    try {
        await AsyncStorage.removeItem('meals');
        console.log('Meals cleared for the new day.');
    } catch (error) {
        console.error('Error clearing meals:', error);
    }
};

const addMeal = (meal: any) => {
    // Retrieve existing meals from AsyncStorage
    AsyncStorage.getItem('meals')
        .then((storedMeals) => {
            const meals = storedMeals ? JSON.parse(storedMeals) : [];
            meals.push(meal);
            saveMeals(meals); // Save updated meals
        })
        .catch((error) => {
            console.error('Error retrieving meals:', error);
        });
};

export { saveMeals, checkAndClearMeals, clearMealsAtMidnight, addMeal, clearMeals };
