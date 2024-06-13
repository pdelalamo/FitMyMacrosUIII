import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, Alert, TextInput, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';

interface Props {
    navigation: any;
}

const TargetCaloriesAndMacros: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();

    const [targetCalories, setTargetCalories] = useState('');
    const [proteinPercentage, setProteinPercentage] = useState(30);
    const [carbsPercentage, setCarbsPercentage] = useState(50);
    const [fatPercentage, setFatPercentage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            const uname = await AsyncStorage.getItem('username');
            setUsername(uname || '');
        };
        loadUserData();
    }, []);

    const calculateMacros = () => {
        const total = parseInt(targetCalories, 10) || 0;
        const proteinGrams = Math.round((total * proteinPercentage) / 400);
        const carbsGrams = Math.round((total * carbsPercentage) / 400);
        const fatGrams = Math.round((total * fatPercentage) / 900);
        return { proteinGrams, carbsGrams, fatGrams };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const validatePercentageInput = (text: string) => {
        const value = parseInt(text, 10);
        return !isNaN(value) && value >= 0 && value <= 100 ? value : proteinPercentage;
    };

    const handleSaveSettings = async () => {
        if (targetCalories === '' || isNaN(Number(targetCalories)) || Number(targetCalories) <= 1000 || Number(targetCalories) >= 10000) {
            Alert.alert(t('error'), t('incorrectCaloriesTarget'), [{ text: t('ok') }]);
            return;
        }

        const sum = proteinPercentage + carbsPercentage + fatPercentage;
        if (sum !== 100) {
            Alert.alert(t('error'), t('macrosError'), [{ text: t('ok') }]);
            return;
        }

        setLoading(true);
        try {
            await AsyncStorage.setItem('targetCalories', targetCalories);
            await AsyncStorage.setItem('proteinPercentage', proteinGrams.toString());
            await AsyncStorage.setItem('carbsPercentage', carbsGrams.toString());
            await AsyncStorage.setItem('fatPercentage', fatGrams.toString());
            setLoading(false);
            navigation.navigate('FreeTrialScreen');
        } catch (error) {
            console.error('Error saving settings', error);
            setLoading(false);
        }
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={initialQuestionsStyles.container}>
                    <ScrollView contentContainerStyle={initialQuestionsStyles.scrollViewContent}>
                        <Text style={initialQuestionsStyles.titleTarget}>{t('setupTargetCalories')}</Text>
                        <TextInput
                            style={[globalStyles.input]}
                            placeholder={t('targetCalories')}
                            keyboardType="numeric"
                            value={targetCalories}
                            onChangeText={text => setTargetCalories(text)}
                        />
                        {(targetCalories === '' || isNaN(Number(targetCalories)) || Number(targetCalories) <= 1000 || Number(targetCalories) >= 10000) && (
                            <Text style={{ color: 'red', marginTop: 10 }}>{t('incorrectCaloriesTarget')}</Text>
                        )}
                        <View style={globalStyles.sliderContainer}>
                            <Text style={{ flex: 1 }}>{t('protein')} (%)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                    keyboardType="numeric"
                                    value={proteinPercentage.toString()}
                                    onChangeText={(text) => setProteinPercentage(validatePercentageInput(text))}
                                />
                                <Slider
                                    style={{ flex: 3, marginLeft: 10 }}
                                    minimumValue={0}
                                    maximumValue={100}
                                    value={proteinPercentage}
                                    onValueChange={value => setProteinPercentage(value)}
                                    step={1}
                                    thumbTintColor="#337010"
                                    minimumTrackTintColor="#337010"
                                />
                            </View>
                        </View>
                        <View style={globalStyles.sliderContainer}>
                            <Text>{t('carbs')} (%)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                    keyboardType="numeric"
                                    value={carbsPercentage.toString()}
                                    onChangeText={(text) => setCarbsPercentage(validatePercentageInput(text))}
                                />
                                <Slider
                                    style={{ flex: 3, marginLeft: 10 }}
                                    minimumValue={0}
                                    maximumValue={100}
                                    value={carbsPercentage}
                                    onValueChange={value => setCarbsPercentage(value)}
                                    step={1}
                                    thumbTintColor="#337010"
                                    minimumTrackTintColor="#337010"
                                />
                            </View>
                        </View>
                        <View style={globalStyles.sliderContainer}>
                            <Text>{t('fat')} (%)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                    keyboardType="numeric"
                                    value={fatPercentage.toString()}
                                    onChangeText={(text) => setFatPercentage(validatePercentageInput(text))}
                                />
                                <Slider
                                    style={{ flex: 3, marginLeft: 10 }}
                                    minimumValue={0}
                                    maximumValue={100}
                                    value={fatPercentage}
                                    onValueChange={value => setFatPercentage(value)}
                                    step={1}
                                    thumbTintColor="#337010"
                                    minimumTrackTintColor="#337010"
                                />
                            </View>
                        </View>
                        <Text style={globalStyles.macroText}>{t('protein')}: {proteinGrams}g</Text>
                        <Text style={globalStyles.macroText}>{t('carbs')}: {carbsGrams}g</Text>
                        <Text style={globalStyles.macroText}>{t('fat')}: {fatGrams}g</Text>
                        {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
                            <Text style={{ color: 'red', marginTop: 10 }}>{t('percentageAlert')}</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity style={globalStyles.buttonGreen} onPress={handleSaveSettings}>
                        <Text style={globalStyles.buttonText}>{t('saveSettings')}</Text>
                    </TouchableOpacity>
                    {loading && (
                        <View style={globalStyles.loadingOverlay}>
                            <TouchableWithoutFeedback>
                                <BlurView intensity={50} style={globalStyles.blurView}>
                                    <ActivityIndicator size="large" color="#388e3c" />
                                </BlurView>
                            </TouchableWithoutFeedback>
                        </View>
                    )}
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default TargetCaloriesAndMacros;
