import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Text, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { checkCognitoUser, signUpUser, verifyEmail } from '../utils/AWSCognito';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FitMyMacrosApiService from '../services/FitMyMacrosApiService';
import SecurityApiService from '../services/SecurityApiService';
import { BlurView } from 'expo-blur';
import { CommonActions } from '@react-navigation/native';

const config = {
    expoClientId: process.env.EXPO_PUBLIC_EXPO_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID!,
};

WebBrowser.maybeCompleteAuthSession();

interface Props {
    navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEmailPasswordFields, setShowEmailPasswordFields] = useState(false);

    const toggleEmailPasswordFields = () => {
        setShowEmailPasswordFields(!showEmailPasswordFields);
    };
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [user, setUserInfo] = useState<any>(null);

    const [request, response, promptAsync] = Google.useAuthRequest(config);
    const [requestF, responseF, promptAsyncF] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FB_AUTH!,
    });

    const [allergies, setAllergies] = useState<string[]>([]);
    const [equipment, setEquipment] = useState<string[]>([]);
    const [dietType, setDietType] = useState<string | null>('');
    const [loading, setLoading] = useState(false);
    const [energyUnit, setEnergyUnit] = useState('');
    const [weightUnit, setWeightUnit] = useState('');
    const [fluidUnit, setFluidUnit] = useState('');
    const [targetEnergy, setTargetEnergy] = useState('');
    const [targetProteinPercentage, setTargetProteinPercentage] = useState('');
    const [targetCarbsPercentage, setTargetCarbsPercentage] = useState('');
    const [targetFatPercentage, setTargetFatPercentage] = useState('');
    const [monthlyGenerations, setMonthlyGenerations] = useState('150');

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const energy = await AsyncStorage.getItem('measurementEnergy');
                const weight = await AsyncStorage.getItem('measurementSolid');
                const fluid = await AsyncStorage.getItem('measurementFluid');
                const monthlyGenerations = await AsyncStorage.getItem('monthlyGenerations');
                const targetEnergy = await AsyncStorage.getItem('targetCalories');
                const targetProteinPercentage = await AsyncStorage.getItem('proteinPercentage');
                const targetCarbsPercentage = await AsyncStorage.getItem('carbsPercentage');
                const targetFatPercentage = await AsyncStorage.getItem('fatPercentage');
                setEnergyUnit(energy || '');
                setWeightUnit(weight || '');
                setFluidUnit(fluid || '');
                setTargetEnergy(targetEnergy || '');
                setTargetProteinPercentage(targetProteinPercentage || '');
                setTargetCarbsPercentage(targetCarbsPercentage || '');
                setTargetFatPercentage(targetFatPercentage || '');
                setMonthlyGenerations(monthlyGenerations || '150');
            } catch (error) {
                console.error('Error loading ingredients map from AsyncStorage:', error);
            }
        };
        const loadAllergies = async () => {
            try {
                const savedAllergies = await AsyncStorage.getItem('allergiesList');
                if (savedAllergies) {
                    setAllergies(JSON.parse(savedAllergies));
                }
            } catch (error) {
                console.error('Error loading allergies list from AsyncStorage:', error);
            }
        };
        const loadDietType = async () => {
            try {
                const diet = await AsyncStorage.getItem('dietType');
                setDietType(diet);
            } catch (error) {
                console.error('Error loading diet type list from AsyncStorage:', error);
            }
        };
        const loadEquipment = async () => {
            try {
                const savedAEq = await AsyncStorage.getItem('equipmentList');
                if (savedAEq) {
                    setEquipment(JSON.parse(savedAEq));
                }
            } catch (error) {
                console.error('Error loading equipment list from AsyncStorage:', error);
            }
        };

        loadDietType();
        loadAllergies();
        loadEquipment();
        loadPreferences();
    }, []);

    useEffect(() => {
        handleGoogleSignIn();
    }, [response]);

    async function handleGoogleSignIn() {
        if (response?.type === 'success' && response.authentication) {
            console.log("response token : " + response.authentication.accessToken);
            setGoogleAccessToken(response.authentication.accessToken);
            await fetchUserInfo();
        } else {
            return;
        }
    };

    useEffect(() => {
        handleFacebookLogin();
    }, [responseF]);


    const fetchUserInfo = async () => {
        if (googleAccessToken) {
            try {
                const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                    headers: { Authorization: `Bearer ${googleAccessToken}` },
                });
                const userInfo = await response.json();
                await AsyncStorage.setItem("@user", JSON.stringify(userInfo));
                setUserInfo(userInfo);
                console.log("email from user from google: " + user.email);
                if (userInfo) {
                    const userExistsInPool = await checkCognitoUser(user.email);
                    if ((userExistsInPool)) {
                        console.log("user aalready exists");
                        Alert.alert(t('alreadyExistingUser'));
                    } else {
                        setLoading(true);
                        signUpUser(user.email, generateRandomPassword(10));
                        await AsyncStorage.setItem("isUserSignedIn", 'true');
                        await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                        await sendUserData();
                        setLoading(false);
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'MainScreen' }],
                            })
                        );
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        }
    };

    async function handleFacebookLogin() {
        if (responseF?.type === 'success' && responseF.authentication) {
            (async () => {
                const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${responseF.authentication?.accessToken}&fields=id,email,name,picture.type(large)`);
                const userInfo = await userInfoResponse.json();
                setUserInfo(userInfo);
                if (userInfo) {
                    const userExistsInPool = await checkCognitoUser(user.email);
                    if ((userExistsInPool)) {
                        console.log("Already registered user");
                        Alert.alert(t('alreadyExistingUser'));
                    } else {
                        setLoading(true);
                        signUpUser(user.email, generateRandomPassword(10));
                        await AsyncStorage.setItem("isUserSignedIn", 'true');
                        await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                        await sendUserData();
                        setLoading(false);
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'MainScreen' }],
                            })
                        );
                    }
                }
            })();
        }
    };

    const handleAppleLogin = async () => {
        // Implement Apple Sign-In and federatedSignIn with AWS Cognito
    };

    async function registerWithEmailPassword() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert(t('emptyAlert'));
            return;
        }
        else if (!emailRegex.test(email)) {
            Alert.alert(t('invalidEmailFormat'));
            return;
        }
        else if (email.trim() && password.trim() && !confirmPassword.trim()) {
            Alert.alert(t('confirmPassword'));
            return;
        }
        else if (password.length < 8) {
            Alert.alert(t('passwordTooShort'));
            return;
        }
        else if (password !== confirmPassword) {
            Alert.alert(t('nMatchPwd'));
            return;
        }
        const userExistsInPool = await checkCognitoUser(email);
        if ((userExistsInPool)) {
            console.log("user already exists");
            Alert.alert(t('alreadyExistingUser'));
        } else {
            setLoading(true);
            await signUpUser(email, password);
            await AsyncStorage.setItem("isUserSignedIn", 'true');
            await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
            await sendUserData();
            setLoading(false);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainScreen' }],
                })
            );
        }
    };

    function generateRandomPassword(length: number) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    async function sendUserData() {
        try {
            await AsyncStorage.setItem('monthlyGenerations', '150');
            setMonthlyGenerations('150');
            const savedMap = await AsyncStorage.getItem('ingredientsMap');
            console.log('savedmap: ' + savedMap);
            const parsedObject = await JSON.parse(savedMap !== null ? savedMap : '{}');
            console.log('parsed object: ' + JSON.stringify(parsedObject, null, 2));

            const parsedMap: Map<string, string> = new Map(Object.entries(parsedObject));
            parsedMap.forEach((value: string, key: string) => {
                console.log(key, value);
            });
            const foodObject = Object.fromEntries(parsedMap);
            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad with leading zero
            const year = currentDate.getFullYear(); // Get year
            const tokenGenerationDate = `${day}/${month}/${year}`; // Something like "25/08/2024"
            await AsyncStorage.setItem('tokenGenerationDate', tokenGenerationDate);
            const userData = {
                userId: email.replace('@', '-at-').toLowerCase(),
                food: foodObject,
                "allergies-intolerances": [...new Set(allergies)],
                "previous_recipes": [],
                vegan: dietType === 'Vegan',
                vegetarian: dietType === 'Vegetarian',
                dietType: dietType,
                equipment: equipment,
                weightUnit: weightUnit,
                fluidUnit: fluidUnit,
                energyUnit: energyUnit,
                targetEnergy: targetEnergy,
                targetProteinPercentage: targetProteinPercentage,
                targetCarbsPercentage: targetCarbsPercentage,
                targetFatPercentage: targetFatPercentage,
                monthlyGenerations: monthlyGenerations,
                tokenGenerationDate: tokenGenerationDate
            };
            const tokenResponse = await SecurityApiService.getToken(`username=${email.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse.body;
            console.log('token: ' + token);

            FitMyMacrosApiService.setAuthToken(token);
            const result = await FitMyMacrosApiService.updateUserData(userData);
            console.log('User data updated successfully:', result);
        } catch (error) {
            console.error('Failed to update user data:', error);
        }
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackgroundFull}>
                <View style={globalStyles.registerContainer}>
                    <TextInput
                        style={globalStyles.input}
                        placeholder={t('email')}
                        onChangeText={setEmail}
                        value={email}
                    />
                    <TextInput
                        style={globalStyles.input}
                        placeholder={t('password')}
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                    />
                    <TextInput
                        style={globalStyles.input}
                        placeholder={t('confirmPassword')}
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                    />
                    <TouchableOpacity style={styles.confirmButton} onPress={registerWithEmailPassword}>
                        <Text style={styles.confirmButtonText}>{t('registerEmailPwd')}</Text>
                    </TouchableOpacity>
                    <View style={federatedStyles.separator}>
                        <View style={federatedStyles.line} />
                        <Text style={federatedStyles.orText}>{t('or')}</Text>
                        <View style={federatedStyles.line} />
                    </View>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#DB4437' }]} onPress={() => { promptAsync() }}>
                        <View style={federatedStyles.buttonContent}>
                            <AntDesign name="google" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerGoogle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={() => { promptAsyncF() }}>
                        <View style={federatedStyles.buttonContent}>
                            <FontAwesome name="facebook" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerFacebook')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <TouchableWithoutFeedback>
                            <BlurView intensity={50} style={styles.blurView}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </BlurView>
                        </TouchableWithoutFeedback>
                    </View>
                )}
            </ImageBackground>
        </I18nextProvider>
    );
};

const styles = StyleSheet.create({
    confirmButton: {
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
});

export default RegisterScreen;
