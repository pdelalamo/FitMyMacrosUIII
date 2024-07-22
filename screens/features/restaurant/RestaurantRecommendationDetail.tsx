import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from 'i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        <View style={styles.card}>
            <Text style={styles.optionName}>{item.optionName}</Text>
            <View style={styles.macroContainer}>
                <Text style={styles.macroLabel}>{t('energy')}: </Text>
                <Text style={styles.macroValue}>{item.energyAndMacros.energy} {(item.energyAndMacros.energy.includes('kcal') || item.energyAndMacros.energy.includes('kilojoules') || item.energyAndMacros.energy.includes('kilocalories') || item.energyAndMacros.energy.toLocaleLowerCase().includes('kj')) ? '' : energyUnit}</Text>
            </View>
            <View style={styles.macroContainer}>
                <Text style={styles.macroLabel}>{t('protein')}: </Text>
                <Text style={styles.macroValue}>{item.energyAndMacros.protein} {weightPreference}</Text>
            </View>
            <View style={styles.macroContainer}>
                <Text style={styles.macroLabel}>{t('carbs')}: </Text>
                <Text style={styles.macroValue}>{item.energyAndMacros.carbs} {weightPreference}</Text>
            </View>
            <View style={styles.macroContainer}>
                <Text style={styles.macroLabel}>{t('fat')}: </Text>
                <Text style={styles.macroValue}>{item.energyAndMacros.fat} {weightPreference}</Text>
            </View>
        </View>
    );

    return (
        <I18nextProvider i18n={i18n}>
            <View style={styles.container}>
                <FlatList
                    data={restaurantRecommendation}
                    renderItem={renderRecommendation}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </I18nextProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 1,
    },
    optionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 10,
    },
    macroContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    macroLabel: {
        fontWeight: 'bold',
        color: '#388E3C',
    },
    macroValue: {
        color: '#555',
    },
});

export default RestaurantRecommendationDetail;