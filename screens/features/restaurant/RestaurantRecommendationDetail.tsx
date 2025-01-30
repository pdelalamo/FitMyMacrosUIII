import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restaurantStyles } from './restaurantStyles';

interface Props {
    navigation: any;
    route: any;
}

interface Macros {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
}

interface Recommendation {
    optionName: string;
    energyAndMacros: Macros;
}

const RestaurantRecommendationDetail: React.FC<Props> = ({ route }) => {
    const { restaurantRecommendation } = route.params || {};
    const { t } = useTranslation();

    const [weightPreference, setWeightPreference] = useState('');
    const [energyUnit, setEnergyUnit] = useState<string>('');

    useEffect(() => {
        const retrievePreferences = async () => {
            try {
                const measurementEnergy = await AsyncStorage.getItem('measurementEnergy');
                setEnergyUnit(measurementEnergy ?? '');

                const measurementSolid = await AsyncStorage.getItem('measurementSolid');
                setWeightPreference(measurementSolid ?? '');
            } catch (error) {
                console.error('Error retrieving preferences:', error);
            }
        };
        retrievePreferences();
    }, []);

    const renderRecommendationItem = ({ item }: { item: Recommendation }) => (
        <View style={restaurantStyles.card}>
            <Text style={restaurantStyles.optionName}>{item.optionName}</Text>
            {renderMacro('energy', item.energyAndMacros.energy, energyUnit)}
            {renderMacro('protein', item.energyAndMacros.protein, weightPreference)}
            {renderMacro('carbs', item.energyAndMacros.carbs, weightPreference)}
            {renderMacro('fat', item.energyAndMacros.fat, weightPreference)}
        </View>
    );

    const renderMacro = (label: string, value: string, unit: string) => (
        <View style={restaurantStyles.macroContainer}>
            <Text style={restaurantStyles.macroLabel}>{t(label)}: </Text>
            <Text style={restaurantStyles.macroValue}>
                {value} {shouldAppendUnit(value, label, unit) ? unit : ''}
            </Text>
        </View>
    );

    const shouldAppendUnit = (value: string, label: string, unit: string) => {
        return !value.toLowerCase().includes(label) && !value.toLowerCase().includes(unit.toLowerCase());
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={restaurantStyles.container}>
                <FlatList
                    data={restaurantRecommendation}
                    renderItem={renderRecommendationItem}
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
        </I18nextProvider>
    );
};

export default RestaurantRecommendationDetail;
