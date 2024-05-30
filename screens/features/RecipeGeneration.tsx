import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import CheckBox from '@react-native-community/checkbox';

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
    const windowHeight = Dimensions.get('window').height;

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
        { label: t('dietaryRestrictions.keto'), value: 'keto' },
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

    const calculateMacros = () => {
        const total = parseInt(recipeTargetCalories, 10) || 0;
        const proteinGrams = Math.round((total * proteinPercentage) / 400);
        const carbsGrams = Math.round((total * carbsPercentage) / 400);
        const fatGrams = Math.round((total * fatPercentage) / 900);
        return { proteinGrams, carbsGrams, fatGrams };
    };

    const { proteinGrams, carbsGrams, fatGrams } = calculateMacros();

    const handleGenerateRecipes = () => {
        if (recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) <= 0 || Number(recipeTargetCalories) >= 5000) {
            // Show alert if calories is not a number in between 0 and 5000
            Alert.alert(
                t('error'),
                t('incorrectCalories'),
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
        } else {
            setModalVisible(!modalVisible);
            // Proceed with generating recipes
            // Your code for generating recipes goes here
        }
    };

    const validatePercentageInput = (text: string): number => {
        const value = parseInt(text, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            return value;
        }
        return proteinPercentage; // Return previous value if input is invalid
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
                        zIndex={4000}
                    />
                    <DropDownPicker
                        open={dietOpen}
                        value={diet}
                        items={dietItems}
                        setOpen={setDietOpen}
                        setValue={setDiet}
                        placeholder={t('selectDietaryRestrictions')}
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
                        placeholder={t('targetCalories')}
                        keyboardType="numeric"
                        value={recipeTargetCalories}
                        onChangeText={text => setRecipeTargetCalories(text)}
                    />
                    {(recipeTargetCalories === '' || isNaN(Number(recipeTargetCalories)) || Number(recipeTargetCalories) <= 0 || Number(recipeTargetCalories) >= 5000) && (
                        <Text style={{ color: 'red', marginTop: 10 }}>
                            {t('incorrectCalories')}
                        </Text>
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
                                style={{ flex: 3, marginLeft: 10 }} // Adjust flex and margin as needed
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
                    <Text>{t('protein')}: {proteinGrams}g</Text>
                    <Text>{t('carbs')}: {carbsGrams}g</Text>
                    <Text>{t('fat')}: {fatGrams}g</Text>
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
                        // Add your function to generate recipes
                        handleGenerateRecipes();
                    }}
                >
                    <Text style={globalStyles.modalButtonText}>{t('generateRecipes')}</Text>
                </TouchableOpacity>
            </View>
        </I18nextProvider>
    );
};

export default RecipeGeneration;
