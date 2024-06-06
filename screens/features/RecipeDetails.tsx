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

const RecipeDetails: React.FC<Props> = ({ navigation }) => {

    return (
        <View>
        </View>
    );
};

export default RecipeDetails;
