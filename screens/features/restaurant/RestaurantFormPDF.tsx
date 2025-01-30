import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, ScrollView, 
  TouchableOpacity, ActivityIndicator, StyleSheet
} from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { globalStyles } from 'globalStyles';
import { restaurantStyles } from './restaurantStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import SecurityApiService from 'services/SecurityApiService';
import Footer from 'utils/Footer';

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

const RestaurantFormPDF: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [mealTime, setMealTime] = useState('');
  const [weightPreference, setWeightPreference] = useState('');
  const [energyUnit, setEnergy] = useState('');
  const [recipeTargetCalories, setRecipeTargetCalories] = useState('');
  const [proteinPercentage, setProteinPercentage] = useState(30);
  const [carbsPercentage, setCarbsPercentage] = useState(50);
  const [fatPercentage, setFatPercentage] = useState(20);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [generationsLeft, setGenerationsLeft] = useState<number | null>(null);

  useEffect(() => {
    const initStates = async () => {
      try {
        const uname = await AsyncStorage.getItem('username');
        setUsername(uname ?? '');

        const energy = await AsyncStorage.getItem('measurementEnergy');
        setEnergy(energy ?? '');

        const solid = await AsyncStorage.getItem('measurementSolid');
        setWeightPreference(solid ?? '');

        const value = await AsyncStorage.getItem('monthlyGenerations');
        setGenerationsLeft(value !== null ? parseInt(value, 10) : 0);
      } catch (error) {
        console.error('Initialization Error', error);
      }
    };

    initStates();
  }, []);

  const calculateMacros = ({ proteinPercentage, carbsPercentage, fatPercentage, recipeTargetCalories, weightPreference }) => {
    const total = parseInt(recipeTargetCalories, 10) || 0;
    const factor = weightPreference === 'grams' ? 1 : 0.03527396195;

    const proteinGrams = Math.round((total * proteinPercentage) / 400 * factor);
    const carbsGrams = Math.round((total * carbsPercentage) / 400 * factor);
    const fatGrams = Math.round((total * fatPercentage) / 900 * factor);

    return { proteinGrams, carbsGrams, fatGrams };
  };

  const validateForm = () => {
    if (!mealTime || !recipeTargetCalories || isNaN(Number(recipeTargetCalories))) {
      Alert.alert(t('error'), t('restaurantForm.missingFields'), [{ text: t('ok') }]);
      return false;
    }

    const energyValue = Number(recipeTargetCalories);
    if ((energyUnit === 'kilocalories' && (energyValue < 200 || energyValue > 5000)) ||
        (energyUnit === 'kilojoules' && (energyValue < 836 || energyValue > 20900))) {
      Alert.alert(t('error'), t('incorrectCaloriesTargetRecipe'), [{ text: t('ok') }]);
      return false;
    }

    if (proteinPercentage + carbsPercentage + fatPercentage !== 100) {
      Alert.alert(t('error'), t('macrosError'), [{ text: t('ok') }]);
      return false;
    }

    if (!pdfBase64) {
      Alert.alert(t('error'), t('pdfError'), [{ text: t('ok') }]);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const macros = calculateMacros({
      proteinPercentage, carbsPercentage, fatPercentage, recipeTargetCalories, weightPreference
    });

    const data = {
      mealTime,
      targetEnergy: recipeTargetCalories,
      protein: macros.proteinGrams,
      carbs: macros.carbsGrams,
      fat: macros.fatGrams,
      energyUnit,
      weightUnit: weightPreference,
      pdf: pdfBase64,
    };

    try {
      setLoading(true);

      const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
      const token = tokenResponse.body;

      FitMyMacrosApiService.setAuthToken(token);
      const restaurantRecommendationRaw = await FitMyMacrosApiService.getRestaurantRecommendationPDF(data);
      const restaurantRecommendation = JSON.parse(JSON.stringify(restaurantRecommendationRaw, null, 2));

      navigation.navigate('RestaurantRecommendationDetail', { restaurantRecommendation });
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        setPdfBase64(base64);
      }
    } catch (error) {
      console.error('Error picking PDF', error);
    }
  };

  const renderMacroInputs = (label: string, percentage: number, setPercentage: Function) => (
    <View style={globalStyles.sliderContainer}>
      <Text>{label} (%)</Text>
      <View style={styles.sliderRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={percentage !== 0 ? percentage.toString() : ''}
          onChangeText={(text) => setPercentage(validatePercentageInput(text))}
        />
        <Slider
          style={styles.slider}
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

  const validatePercentageInput = (text: string): number => {
    const value = parseInt(text, 10);
    return isNaN(value) || value < 0 || value > 100 ? 0 : value;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <View style={styles.topContainer}>
        <Text>{t('monthlyMealGenerationsLeft')}: {generationsLeft}</Text>
        {generationsLeft === 0 && (
          <TouchableOpacity
            style={[
              globalStyles.buyMoreCreditsButton,
              generationsLeft !== 0 && styles.disabledButton
            ]}
            disabled={generationsLeft > 0}
            onPress={() => navigation.navigate('PurchaseCredits')}
          >
            <Text style={globalStyles.buttonTextWhite}>{t('buyMoreCredits')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={restaurantStyles.container}>

        <Text style={restaurantStyles.label}>{t('restaurantForm.mealTime')}</Text>
        <TextInput
          style={restaurantStyles.input}
          value={mealTime}
          onChangeText={setMealTime}
          placeholder={t('restaurantForm.enterMealTime')}
        />

        <TextInput
          style={globalStyles.inputRecipe}
          placeholder={energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
          keyboardType="numeric"
          value={recipeTargetCalories}
          onChangeText={setRecipeTargetCalories}
        />

        {renderMacroInputs(t('protein'), proteinPercentage, setProteinPercentage)}
        {renderMacroInputs(t('carbs'), carbsPercentage, setCarbsPercentage)}
        {renderMacroInputs(t('fat'), fatPercentage, setFatPercentage)}

        <Text>{`${t('protein')}: ${proteinGrams} ${weightPreference === 'grams' ? 'g' : 'oz'}`}</Text>
        <Text>{`${t('carbs')}: ${carbsGrams} ${weightPreference === 'grams' ? 'g' : 'oz'}`}</Text>
        <Text>{`${t('fat')}: ${fatGrams} ${weightPreference === 'grams' ? 'g' : 'oz'}`}</Text>

        {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
          <Text style={styles.alertText}>{t('percentageAlert')}</Text>
        )}

        <TouchableOpacity
          style={globalStyles.buttonGrey}
          disabled={generationsLeft === 0}
          onPress={handlePdfPick}
        >
          <Text style={globalStyles.buttonText}>{t('restaurantForm.selectPdf')}</Text>
        </TouchableOpacity>

        {pdfBase64 && (
          <Text style={restaurantStyles.pdfInfo}>
            {t('restaurantForm.pdfSelected')}
          </Text>
        )}

        <TouchableOpacity
          style={[
            globalStyles.buttonGreen,
            generationsLeft === 0 && styles.disabledButton
          ]}
          disabled={generationsLeft === 0}
          onPress={handleSubmit}
        >
          <Text style={globalStyles.buttonText}>{t('restaurantForm.submit')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={globalStyles.loadingOverlay}>
          <BlurView intensity={50} style={globalStyles.blurView}>
            <ActivityIndicator size="large" color="#0000ff" />
          </BlurView>
        </View>
      )}
      <Footer navigation={navigation} />
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  slider: {
    flex: 3,
    marginLeft: 10,
  },
  alertText: {
    color: 'red',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: 'grey',
  },
});

export default RestaurantFormPDF;
