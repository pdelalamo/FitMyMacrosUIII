import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../../globalStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { settingsStyles } from './settingsStyles';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import Footer from 'utils/Footer';

interface Props {
  navigation: any;
}

const MIN_CALORIES = 1000;
const MAX_CALORIES = 10000;
const MIN_KILOJOULES = 4184;
const MAX_KILOJOULES = 41840;
const MACRO_MULTIPLIER = {
  protein: 4,
  carbs: 4,
  fat: 9,
};
const GRAM_TO_OUNCE = 0.03527396195;

const useLoadUserData = () => {
  const [username, setUsername] = useState('');
  const [energyUnit, setEnergyUnit] = useState('');
  const [weightUnit, setWeightUnit] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [proteinPercentage, setProteinPercentage] = useState(30);
  const [carbsPercentage, setCarbsPercentage] = useState(50);
  const [fatPercentage, setFatPercentage] = useState(20);

  useEffect(() => {
    const loadUserData = async () => {
      const uname = await AsyncStorage.getItem('username');
      const energy = await AsyncStorage.getItem('measurementEnergy');
      const weight = await AsyncStorage.getItem('measurementSolid');
      const storedTargetCalories = await AsyncStorage.getItem('targetCalories');
      const storedTargetProtein = await AsyncStorage.getItem('proteinPercentage');
      const storedTargetCarbs = await AsyncStorage.getItem('carbsPercentage');
      const storedTargetFat = await AsyncStorage.getItem('fatPercentage');

      setUsername(uname || '');
      setEnergyUnit(energy || '');
      setWeightUnit(weight || '');

      if (storedTargetCalories) {
        setTargetCalories(storedTargetCalories);
        if (storedTargetProtein) {
          setProteinPercentage(calculateMacroPercentage('protein', storedTargetProtein, storedTargetCalories, weight));
        }
        if (storedTargetCarbs) {
          setCarbsPercentage(calculateMacroPercentage('carbs', storedTargetCarbs, storedTargetCalories, weight));
        }
        if (storedTargetFat) {
          setFatPercentage(calculateMacroPercentage('fat', storedTargetFat, storedTargetCalories, weight));
        }
      }
    };
    loadUserData();
  }, []);

  return {
    username,
    energyUnit,
    weightUnit,
    targetCalories,
    setTargetCalories,
    proteinPercentage,
    setProteinPercentage,
    carbsPercentage,
    setCarbsPercentage,
    fatPercentage,
    setFatPercentage,
  };
};

const calculateMacroPercentage = (
  macroType: keyof typeof MACRO_MULTIPLIER,
  storedValue: string,
  storedTargetCalories: string,
  weight: string
): number => {
  const macroGrams = parseFloat(storedValue);
  const calories = parseInt(storedTargetCalories, 10);
  if (weight === 'grams') {
    return Math.round((macroGrams * MACRO_MULTIPLIER[macroType] * 100) / calories);
  }
  return Math.round((macroGrams * MACRO_MULTIPLIER[macroType] * 100 * 28.3495) / calories);
};

const TargetEnergyAndMacros: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    energyUnit,
    weightUnit,
    targetCalories,
    setTargetCalories,
    proteinPercentage,
    setProteinPercentage,
    carbsPercentage,
    setCarbsPercentage,
    fatPercentage,
    setFatPercentage,
  } = useLoadUserData();
  const [loading, setLoading] = useState(false);

  const calculateMacros = () => {
    const total = parseInt(targetCalories, 10) || 0;

    const calculateMacroGrams = (percentage: number, divisor: number) => {
      return Math.round((total * percentage) / 100 / divisor * (weightUnit === 'grams' ? 1 : GRAM_TO_OUNCE));
    };

    return {
      proteinGrams: calculateMacroGrams(proteinPercentage, MACRO_MULTIPLIER.protein),
      carbsGrams: calculateMacroGrams(carbsPercentage, MACRO_MULTIPLIER.carbs),
      fatGrams: calculateMacroGrams(fatPercentage, MACRO_MULTIPLIER.fat),
    };
  };

  const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

  const validatePercentageInput = (text: string, currentPercentage: number) => {
    const value = parseInt(text, 10);
    return !isNaN(value) && value >= 0 && value <= 100 ? value : currentPercentage;
  };

  const handleSaveSettings = async () => {
    const calorieLimitMsg = energyUnit === 'kilocalories' ? 'incorrectCaloriesTarget' : 'incorrectKilojoulesTarget';
    const minCalories = energyUnit === 'kilocalories' ? MIN_CALORIES : MIN_KILOJOULES;
    const maxCalories = energyUnit === 'kilocalories' ? MAX_CALORIES : MAX_KILOJOULES;

    if (!isCaloriesValid(minCalories, maxCalories)) {
      Alert.alert(t('error'), t(calorieLimitMsg), [{ text: t('ok') }]);
      return;
    }

    if (!areMacrosValid()) {
      Alert.alert(t('error'), t('macrosError'), [{ text: t('ok') }]);
      return;
    }

    saveSettings();
  };

  const isCaloriesValid = (min: number, max: number) => {
    const calories = Number(targetCalories);
    return !(targetCalories === '' || isNaN(calories) || calories < min || calories > max);
  };

  const areMacrosValid = () => proteinPercentage + carbsPercentage + fatPercentage === 100;

  const saveSettings = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('targetCalories', targetCalories);
      await AsyncStorage.setItem('proteinPercentage', proteinGrams.toString());
      await AsyncStorage.setItem('carbsPercentage', carbsGrams.toString());
      await AsyncStorage.setItem('fatPercentage', fatGrams.toString());
      await FitMyMacrosApiService.sendUserData();
      navigation.navigate('SettingsScreen');
    } catch (error) {
      console.error('Error saving settings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ImageBackground
        source={require('../../assets/images/main_background.png')}
        resizeMode="cover"
        style={globalStyles.imageBackground}
      >
        <View style={settingsStyles.containerSettings}>
          <ScrollView contentContainerStyle={settingsStyles.scrollViewContent}>
            <TargetCaloriesInput
              energyUnit={energyUnit}
              targetCalories={targetCalories}
              setTargetCalories={setTargetCalories}
              t={t}
            />
            <MacroSlider
              label={t('protein')}
              percentage={proteinPercentage}
              setPercentage={setProteinPercentage}
              validateInput={validatePercentageInput}
            />
            <MacroSlider
              label={t('carbs')}
              percentage={carbsPercentage}
              setPercentage={setCarbsPercentage}
              validateInput={validatePercentageInput}
            />
            <MacroSlider
              label={t('fat')}
              percentage={fatPercentage}
              setPercentage={setFatPercentage}
              validateInput={validatePercentageInput}
            />
            <MacroSummary
              t={t}
              macros={{ proteinGrams, carbsGrams, fatGrams }}
              weightUnit={weightUnit}
            />
          </ScrollView>
          <SaveButton onPress={handleSaveSettings} t={t} />
        </View>
      </ImageBackground>
      {loading && (
        <LoadingOverlay />
      )}
      <Footer navigation={navigation} />
    </I18nextProvider>
  );
};

// Functional Components for better readability
const TargetCaloriesInput: React.FC<{
  energyUnit: string;
  targetCalories: string;
  setTargetCalories: React.Dispatch<React.SetStateAction<string>>;
  t: (key: string) => string;
}> = ({ energyUnit, targetCalories, setTargetCalories, t }) => {
  const errorMessage =
    energyUnit === 'kilocalories' ? 'incorrectCaloriesTarget' : 'incorrectKilojoulesTarget';
  return (
    <>
      <Text style={settingsStyles.titleTarget}>
        {energyUnit === 'kilocalories' ? t('setupTargetCalories') : t('setupTargetKj')}
      </Text>
      <TextInput
        style={[globalStyles.input]}
        placeholder={energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
        keyboardType="numeric"
        value={targetCalories}
        onChangeText={setTargetCalories}
      />
      {isError(targetCalories, energyUnit) && (
        <Text style={{ color: 'red', marginTop: 10 }}>{t(errorMessage)}</Text>
      )}
    </>
  );
};

const isError = (targetCalories: string, energyUnit: string) => {
  const calories = Number(targetCalories);
  if (energyUnit === 'kilocalories') {
    return (
      targetCalories === '' ||
      isNaN(calories) ||
      calories < MIN_CALORIES ||
      calories > MAX_CALORIES
    );
  }
  return (
    targetCalories === '' ||
    isNaN(calories) ||
    calories < MIN_KILOJOULES ||
    calories > MAX_KILOJOULES
  );
};

const MacroSlider: React.FC<{
  label: string;
  percentage: number;
  setPercentage: React.Dispatch<React.SetStateAction<number>>;
  validateInput: (text: string, currentPercentage: number) => number;
}> = ({ label, percentage, setPercentage, validateInput }) => (
  <View style={globalStyles.sliderContainer}>
    <Text>{label} (%)</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 5,
          paddingHorizontal: 5,
          paddingVertical: 5,
        }}
        keyboardType="numeric"
        value={percentage !== 0 ? percentage.toString() : ''}
        onChangeText={(text) => setPercentage(validateInput(text, percentage))}
      />
      <Slider
        style={{ flex: 3, marginLeft: 10 }}
        minimumValue={0}
        maximumValue={100}
        value={percentage}
        onValueChange={setPercentage}
        step={1}
        thumbTintColor="#337010"
        minimumTrackTintColor="#337010"
      />
    </View>
  </View>
);

const MacroSummary: React.FC<{
  t: (key: string) => string;
  macros: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  weightUnit: string;
}> = ({ t, macros, weightUnit }) => (
  <>
    <Text style={globalStyles.macroText}>
      {t('protein')}: {macros.proteinGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
    </Text>
    <Text style={globalStyles.macroText}>
      {t('carbs')}: {macros.carbsGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
    </Text>
    <Text style={globalStyles.macroText}>
      {t('fat')}: {macros.fatGrams} {weightUnit === 'grams' ? 'g' : 'oz'}
    </Text>
  </>
);

const SaveButton: React.FC<{ onPress: () => void; t: (key: string) => string }> = ({
  onPress,
  t,
}) => (
  <TouchableOpacity style={globalStyles.buttonGreen} onPress={onPress}>
    <Text style={globalStyles.buttonText}>{t('save')}</Text>
  </TouchableOpacity>
);

const LoadingOverlay = () => (
  <View style={globalStyles.loadingOverlay}>
    <TouchableWithoutFeedback>
      <BlurView intensity={50} style={globalStyles.blurView}>
        <ActivityIndicator size="large" color="#388e3c" />
      </BlurView>
    </TouchableWithoutFeedback>
  </View>
);

export default TargetEnergyAndMacros;
