import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecipeFeature from '../screens/productFeatures/RecipeFeature';
import GoalsFeature from '../screens/productFeatures/GoalsFeature';
import RestaurantFeature from '../screens/productFeatures/RestaurantFeature';
import AiFeature from '../screens/productFeatures/AiFeature';
import ChooseDiet from '../screens/initialQuestions/ChooseDiet';

const Stack = createNativeStackNavigator();

const Navigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="RecipeFeature" component={RecipeFeature} />
                <Stack.Screen name="GoalsFeature" component={GoalsFeature} />
                <Stack.Screen name="AiFeature" component={AiFeature} />
                <Stack.Screen name="RestaurantFeature" component={RestaurantFeature} />
                <Stack.Screen name="ChooseDiet" component={ChooseDiet} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;
