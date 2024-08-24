import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from 'globalStyles';

interface FooterProps {
    navigation: any;
}

const Footer: React.FC<FooterProps> = ({ navigation }) => {

    return (
        <View style={globalStyles.footer}>
            <Ionicons name="home" size={35} color="white" onPress={() => navigation.navigate('MainScreen')} />
            <Ionicons name="color-wand-outline" size={35} color="white" onPress={() => navigation.navigate('RestaurantRecommender')} />
            <Ionicons name="star" size={35} color="white" onPress={() => navigation.navigate('FavoriteRecipes')} />
            <Ionicons name="settings" size={35} color="white" onPress={() => navigation.navigate('SettingsScreen')} />
        </View>
    );
};

export default Footer;
