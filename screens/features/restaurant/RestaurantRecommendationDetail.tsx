import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantStyles } from './restaurantStyles';

interface Props {
    navigation: any;
    route: any;
}

type Macros = {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
};

type Recommendation = {
    optionName: string;
    energyAndMacros: Macros;
};

const RestaurantRecommendationDetail: React.FC<Props> = ({ navigation, route }) => {
    const { restaurantRecommendation } = route.params;
    const { t } = useTranslation();

    const [weightPreference, setWeightPreference] = useState('');
    const [energyUnit, setEnergy] = useState<string>('');

    useEffect(() => {
        const loadPreferences = async () => {
            console.log('logs work');
            try {
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setEnergy(energy === null ? '' : energy);
                const solid = await AsyncStorage.getItem('measurementSolid');
                setWeightPreference(solid === null ? '' : solid);
            } catch (error) {
                console.error('Error loading preferences', error);
            }
        };
        loadPreferences();
    }, []);

    const renderRecommendation: ListRenderItem<Recommendation> = ({ item }) => (
        <View style={restaurantStyles.card}>
            <Text style={restaurantStyles.optionName}>{item.optionName}</Text>
            <View style={restaurantStyles.macroContainer}>
                <Text style={restaurantStyles.macroLabel}>{t('energy')}: </Text>
                <Text style={restaurantStyles.macroValue}>{item.energyAndMacros.energy} {(item.energyAndMacros.energy.includes('kcal') || item.energyAndMacros.energy.includes('kilojoules') || item.energyAndMacros.energy.includes('kilocalories') || item.energyAndMacros.energy.toLocaleLowerCase().includes('kj')) ? '' : energyUnit}</Text>
            </View>
            <View style={restaurantStyles.macroContainer}>
                <Text style={restaurantStyles.macroLabel}>{t('protein')}: </Text>
                <Text style={restaurantStyles.macroValue}>{item.energyAndMacros.protein} {weightPreference}</Text>
            </View>
            <View style={restaurantStyles.macroContainer}>
                <Text style={restaurantStyles.macroLabel}>{t('carbs')}: </Text>
                <Text style={restaurantStyles.macroValue}>{item.energyAndMacros.carbs} {weightPreference}</Text>
            </View>
            <View style={restaurantStyles.macroContainer}>
                <Text style={restaurantStyles.macroLabel}>{t('fat')}: </Text>
                <Text style={restaurantStyles.macroValue}>{item.energyAndMacros.fat} {weightPreference}</Text>
            </View>
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <View style={restaurantStyles.container}>
                <FlatList
                    data={restaurantRecommendation}
                    renderItem={renderRecommendation}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </I18nextProvider>
    );
};

export default RestaurantRecommendationDetail;