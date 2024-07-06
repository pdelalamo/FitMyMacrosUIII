import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import CheckBox from '@react-native-community/checkbox';
import SecurityApiService from 'services/SecurityApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import { BlurView } from 'expo-blur';
import { generateRandomString } from 'utils/UtilFunctions';

interface Props {
    navigation: any;
}

const RecipeGeneration: React.FC<Props> = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [cuisine, setCuisine] = useState('');
    const [flavor, setFlavor] = useState('');
    const [satiety, setSatiety] = useState('');
    const [recipeTargetCalories, setRecipeTargetCalories] = useState('');
    const [proteinPercentage, setProteinPercentage] = useState(30);
    const [carbsPercentage, setCarbsPercentage] = useState(50);
    const [fatPercentage, setFatPercentage] = useState(20);
    const [cuisineOpen, setCuisineOpen] = useState(false);
    const [flavorOpen, setFlavorOpen] = useState(false);
    const [satietyOpen, setSatietyOpen] = useState(false);
    const [dietOpen, setDietOpen] = useState(false);
    const [diet, setDiet] = useState('');
    const [cookingTimeOpen, setCookingTimeOpen] = useState(false);
    const [cookingTime, setCookingTime] = useState('');
    const [occasionOpen, setOccasionOpen] = useState(false);
    const [occasion, setOccasion] = useState('');
    const [toggleCheckBox, setToggleCheckBox] = useState(false);
    const [username, setUsername] = useState('');
    const [opId, setOpId] = useState('');
    const [loading, setLoading] = useState(false);
    const [weightPreference, setWeightPreference] = useState('');
    const [energyUnit, setEnergy] = useState<string>('');

    const flavorItems = [
        { label: t('flavors.any'), value: 'any' },
        { label: t('flavors.spicy'), value: 'spicy' },
        { label: t('flavors.sweet'), value: 'sweet' },
        { label: t('flavors.savory'), value: 'savory' },
        { label: t('flavors.sour'), value: 'sour' },
        { label: t('flavors.bitter'), value: 'bitter' },
        { label: t('flavors.umami'), value: 'umami' },
        { label: t('flavors.salty'), value: 'salty' },
        { label: t('flavors.fruity'), value: 'fruity' },
        { label: t('flavors.herby'), value: 'herby' },
        { label: t('flavors.earthy'), value: 'earthy' },
    ];
    const cuisineItems = [
        { label: t('cuisines.any'), value: 'any' },
        { label: t('cuisines.african'), value: 'african' },
        { label: t('cuisines.american'), value: 'american' },
        { label: t('cuisines.mediterranean'), value: 'mediterranean' },
        { label: t('cuisines.asian'), value: 'asian' },
        { label: t('cuisines.european'), value: 'european' },
        { label: t('cuisines.latinAmerican'), value: 'latinAmerican' },
        { label: t('cuisines.middleEastern'), value: 'middleEastern' },
        { label: t('cuisines.indian'), value: 'indian' },
        { label: t('cuisines.chinese'), value: 'chinese' },
        { label: t('cuisines.japanese'), value: 'japanese' },
        { label: t('cuisines.korean'), value: 'korean' },
        { label: t('cuisines.thai'), value: 'thai' },
    ];
    const satietyLevelItems = [
        { label: t('satietyLevel.any'), value: 'any' },
        { label: t('satietyLevel.satiating'), value: 'satiating' },
        { label: t('satietyLevel.nonSatiating'), value: 'nonSatiating' },
    ];
    const dietItems = [
        { label: t('dietaryRestrictions.none'), value: 'none' },
        { label: t('dietaryRestrictions.vegan'), value: 'vegan' },
        { label: t('dietaryRestrictions.vegetarian'), value: 'vegetarian' },
        { label: t('dietaryRestrictions.glutenFree'), value: 'glutenFree' },
        { label: t('dietaryRestrictions.paleo'), value: 'paleo' },
        { label: t('dietaryRestrictions.pescatarian'), value: 'pescatarian' },
        { label: t('dietaryRestrictions.dairyFree'), value: 'dairyFree' },
        { label: t('dietaryRestrictions.nutFree'), value: 'nutFree' },
        { label: t('dietaryRestrictions.halal'), value: 'halal' },
        { label: t('dietaryRestrictions.kosher'), value: 'kosher' },
    ];
    const cookingTimeItems = [
        { label: t('cookingTimes.30min'), value: '30min' },
        { label: t('cookingTimes.1h'), value: '1h' },
        { label: t('cookingTimes.moreThan1h'), value: 'moreThan1h' },
    ];
    const occasionItems = [
        { label: t('occasions.breakfast'), value: 'breakfast' },
        { label: t('occasions.lunch'), value: 'lunch' },
        { label: t('occasions.snack'), value: 'snack' },
        { label: t('occasions.dinner'), value: 'dinner' },
        { label: t('occasions.any'), value: 'any' },
    ];

    useEffect(() => {
        const loadDailyMeals = async () => {
            try {
                const uname = await AsyncStorage.getItem('username');
                setUsername(uname === null ? '' : uname);
            } catch (error) {
                console.error('Error loading username', error);
            }
        };
        const loadPreferences = async () => {
            try {
                const energy = await AsyncStorage.getItem('measurementEnergy');
                setEnergy(energy === null ? '' : energy);
                const solid = await AsyncStorage.getItem('measurementSolid');
                setWeightPreference(solid === null ? '' : solid);
            } catch (error) {
                console.error('Error loading preferences', error);
            }
        };
        loadDailyMeals();
        loadPreferences();
    }, []);

    const calculateMacros = () => {
        const total = parseInt(recipeTargetCalories, 10) || 0;
        const proteinGrams = weightPreference === 'grams' ? Math.round((total * proteinPercentage) / 400) : Math.round((total * proteinPercentage) / 400 * 0.03527396195);
        const carbsGrams = weightPreference === 'grams' ? Math.round((total * carbsPercentage) / 400) : Math.round((total * carbsPercentage) / 400 * 0.03527396195);
        const fatGrams = weightPreference === 'grams' ? Math.round((total * fatPercentage) / 900) : Math.round((total * fatPercentage) / 900 * 0.03527396195);
        return { proteinGrams, carbsGrams, fatGrams };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const handleGenerateRecipes = async () => {
        if (energyUnit === 'kilocalories' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 200 || Number(recipeTargetCalories) > 5000)) {
            // Show alert if calories is not a number in between 200 and 5000
            Alert.alert(
                t('error'),
                t('incorrectCaloriesTargetRecipe'),
                [{ text: t('ok') }]
            );
            return;
        } else if (energyUnit === 'kilojoules' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 836 || Number(recipeTargetCalories) > 20900)) {
            // Show alert if kJ is not a number in between 836 and 20900
            Alert.alert(
                t('error'),
                t('incorrectKilojoulesTargetRecipe'),
                [{ text: t('ok') }]
            );
            return;
        }
        const sum = proteinPercentage + carbsPercentage + fatPercentage;
        if (sum !== 100) {
            // Show alert if the sum is not equal to 100
            Alert.alert(
                t('error'),
                t('macrosError'),
                [{ text: t('ok') }]
            );
        } else if (cuisine === '' || flavor === '' || satiety === '' || cookingTime === '' || occasion === '') {
            Alert.alert(
                t('error'),
                t('dropdownsError'),
                [{ text: t('ok') }]
            );
        } else {
            setModalVisible(!modalVisible);
            console.log('username: ' + username);
            setLoading(true);
            const tokenResponse = await SecurityApiService.getToken(`username=${username}`);
            const token = tokenResponse.body;
            console.log('token: ' + token);

            FitMyMacrosApiService.setAuthToken(token);
            setOpId(generateRandomString(20));
            const recipesResponse = await FitMyMacrosApiService.getRecipes({
                measureUnit: weightPreference,
                calories: Number(recipeTargetCalories),
                protein: proteinGrams,
                carbs: carbsGrams,
                fat: fatGrams,
                satietyLevel: satiety,
                anyIngredientsMode: toggleCheckBox,
                expandIngredients: false,
                glutenFree: false,
                vegan: false,
                vegetarian: false,
                cuisineStyle: cuisine,
                cookingTime: cookingTime,
                flavor: flavor,
                occasion: occasion,
                userId: username,
                precision: 'exactly',
                opId: opId
            });
            console.log('recipesResponse: ' + recipesResponse);
            const recipes = await JSON.parse(recipesResponse.body);
            await AsyncStorage.setItem('recipesList', JSON.stringify(recipes));
            console.log('recipes: ' + recipes);
            setLoading(false);
            navigation.navigate('GeneratedRecipesList', {
                measureUnit: weightPreference,
                calories: Number(recipeTargetCalories),
                protein: proteinGrams,
                carbs: carbsGrams,
                fat: fatGrams,
                anyIngredientsMode: toggleCheckBox,
                glutenFree: false,
                vegan: false,
                vegetarian: false,
                cookingTime: cookingTime,
                userId: username,
                precision: 'exactly'
            });
        }
    };

    const validatePercentageInput = (text: string): number => {
        if (text === '') {
            return 0; // Treat empty input as 0
        }
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            return value;
        }
        return proteinPercentage;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerMainGeneration}>
                <ScrollView>
                    <DropDownPicker
                        open={cuisineOpen}
                        value={cuisine}
                        items={cuisineItems}
                        setOpen={setCuisineOpen}
                        setValue={setCuisine}
                        placeholder={t('selectCuisineStyle')}
                        containerStyle={globalStyles.dropdown}
                        zIndex={5000}
                    />
                    <DropDownPicker
                        open={flavorOpen}
                        value={flavor}
                        items={flavorItems}
                        setOpen={setFlavorOpen}
                        placeholder={t('selectFlavorProfile')}
                        setValue={setFlavor}
                        containerStyle={globalStyles.dropdown}
                        zIndex={4000}
                    />
                    <DropDownPicker
                        open={satietyOpen}
                        value={satiety}
                        items={satietyLevelItems}
                        setOpen={setSatietyOpen}
                        placeholder={t('selectSatietyLevel')}
                        setValue={setSatiety}
                        containerStyle={globalStyles.dropdown}
                        zIndex={3000}
                    />

                    <DropDownPicker
                        open={cookingTimeOpen}
                        value={cookingTime}
                        items={cookingTimeItems}
                        setOpen={setCookingTimeOpen}
                        setValue={setCookingTime}
                        placeholder={t('selectCookingTime')}
                        containerStyle={globalStyles.dropdown}
                        zIndex={2000}
                    />
                    <DropDownPicker
                        open={occasionOpen}
                        value={occasion}
                        items={occasionItems}
                        setOpen={setOccasionOpen}
                        setValue={setOccasion}
                        placeholder={t('selectOccasion')}
                        containerStyle={globalStyles.dropdown}
                        zIndex={1000}
                    />
                    <TextInput
                        style={globalStyles.inputRecipe}
                        placeholder={energyUnit === 'kilocalories' ? t('targetCalories') : t('targetKj')}
                        keyboardType="numeric"
                        value={recipeTargetCalories}
                        onChangeText={text => setRecipeTargetCalories(text)}
                    />
                    {(energyUnit === 'kilocalories' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 200 || Number(recipeTargetCalories) > 3000)) && (
                        <Text style={{ color: 'red', marginTop: 10 }}>{t('incorrectCaloriesTargetRecipe')}</Text>
                    )}
                    {(energyUnit === 'kilojoules' && (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) < 836 || Number(recipeTargetCalories) > 12540)) && (
                        <Text style={{ color: 'red', marginTop: 10 }}>{t('incorrectKilojoulesTargetRecipe')}</Text>
                    )}
                    <View style={globalStyles.sliderContainer}>
                        <Text style={{ flex: 1 }}>{t('protein')} (%)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <TextInput
                                style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 5 }}
                                keyboardType="numeric"
                                value={proteinPercentage !== 0 ? proteinPercentage.toString() : ''}
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
                                value={carbsPercentage !== 0 ? carbsPercentage.toString() : ''}
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
                                value={fatPercentage !== 0 ? fatPercentage.toString() : ''}
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
                    <Text>{t('protein')}: {proteinGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                    <Text>{t('carbs')}: {carbsGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                    <Text>{t('fat')}: {fatGrams} {weightPreference === 'grams' ? 'g' : 'oz'}</Text>
                    {proteinPercentage + carbsPercentage + fatPercentage !== 100 && (
                        <Text style={{ color: 'red', marginTop: 10 }}>
                            {t('percentageAlert')}
                        </Text>
                    )}
                    <View style={globalStyles.checkboxContainer}>
                        <View style={globalStyles.checkboxRow}>
                            <CheckBox
                                style={{ marginBottom: '30%', marginLeft: '10%' }}
                                disabled={false}
                                value={toggleCheckBox}
                                onValueChange={(newValue) => setToggleCheckBox(newValue)}
                            />
                            <Text style={globalStyles.modalText}>{t('expandIngredients')}</Text>
                        </View>
                        <Text style={globalStyles.expandIngredientsInfo}>
                            {t('expandIngredientsInfo')}
                        </Text>
                    </View>

                </ScrollView>
                <TouchableOpacity
                    style={globalStyles.modalButton}
                    onPress={() => {
                        handleGenerateRecipes();
                    }}
                >
                    <Text style={globalStyles.modalButtonText}>{t('generateRecipes')}</Text>
                </TouchableOpacity>
                {loading && (
                    <View style={globalStyles.loadingOverlay}>
                        <TouchableWithoutFeedback>
                            <BlurView intensity={50} style={globalStyles.blurView}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </BlurView>
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </View>
        </I18nextProvider>
    );
};

export default RecipeGeneration;

