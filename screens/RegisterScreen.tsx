import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Text,
    Alert,
    ActivityIndicator,
    TouchableWithoutFeedback
} from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { checkCognitoUser, signUpUser } from '../utils/AWSCognito';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import FitMyMacrosApiService from '../services/FitMyMacrosApiService';
import SecurityApiService from '../services/SecurityApiService';
import { BlurView } from 'expo-blur';

WebBrowser.maybeCompleteAuthSession();

interface Props {
    navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    // State Hooks
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEmailPasswordFields, setShowEmailPasswordFields] = useState(false);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [user, setUserInfo] = useState<any>(null);
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

    // Auth Request Hooks
    const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_EXPO_CLIENT_ID!,
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID!,
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID!,
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID!,
    });
    
    const [facebookRequest, facebookResponse, promptFacebook] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FB_AUTH!,
    });

    useEffect(() => {
        initializeData();
    }, []);

    useEffect(() => {
        handleGoogleSignIn();
    }, [googleResponse]);

    useEffect(() => {
        handleFacebookLogin();
    }, [facebookResponse]);

    const initializeData = async () => {
        await loadAsyncData();
    };

    const loadAsyncData = async () => {
        try {
            await loadPreferences();
            await loadAllergies();
            await loadDietType();
            await loadEquipment();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const measurementPrefs = await AsyncStorage.multiGet([
                'measurementEnergy',
                'measurementSolid',
                'measurementFluid',
                'monthlyGenerations',
                'targetCalories',
                'proteinPercentage',
                'carbsPercentage',
                'fatPercentage'
            ]);

            setEnergyUnit(measurementPrefs[0][1] || '');
            setWeightUnit(measurementPrefs[1][1] || '');
            setFluidUnit(measurementPrefs[2][1] || '');
            setTargetEnergy(measurementPrefs[4][1] || '');
            setTargetProteinPercentage(measurementPrefs[5][1] || '');
            setTargetCarbsPercentage(measurementPrefs[6][1] || '');
            setTargetFatPercentage(measurementPrefs[7][1] || '');
            setMonthlyGenerations(measurementPrefs[3][1] || '150');
        } catch (error) {
            console.error('Error loading preferences from AsyncStorage:', error);
        }
    };

    const loadAllergies = async () => {
        try {
            const savedAllergies = await AsyncStorage.getItem('allergiesList');
            if (savedAllergies) {
                setAllergies(JSON.parse(savedAllergies));
            }
        } catch (error) {
            console.error('Error loading allergies from AsyncStorage:', error);
        }
    };

    const loadDietType = async () => {
        try {
            const diet = await AsyncStorage.getItem('dietType');
            setDietType(diet);
        } catch (error) {
            console.error('Error loading diet type from AsyncStorage:', error);
        }
    };

    const loadEquipment = async () => {
        try {
            const savedEquipment = await AsyncStorage.getItem('equipmentList');
            if (savedEquipment) {
                setEquipment(JSON.parse(savedEquipment));
            }
        } catch (error) {
            console.error('Error loading equipment from AsyncStorage:', error);
        }
    };

    const handleGoogleSignIn = async () => {
        if (googleResponse?.type === 'success' && googleResponse.authentication) {
            setGoogleAccessToken(googleResponse.authentication.accessToken);
            await fetchUserInfo();
        }
    };

    const handleFacebookLogin = async () => {
        if (facebookResponse?.type === 'success' && facebookResponse.authentication) {
            await fetchFacebookUserInfo();
        }
    };

    const fetchUserInfo = async () => {
        if (googleAccessToken) {
            try {
                const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                    headers: { Authorization: `Bearer ${googleAccessToken}` },
                });
                const userInfo = await response.json();
                setUserInfo(userInfo);
                handleUserSignUp(userInfo.email);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        }
    };

    const fetchFacebookUserInfo = async () => {
        try {
            const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${facebookResponse.authentication?.accessToken}&fields=id,email,name,picture.type(large)`);
            const userInfo = await userInfoResponse.json();
            setUserInfo(userInfo);
            handleUserSignUp(userInfo.email);
        } catch (error) {
            console.error('Failed to fetch Facebook user data:', error);
        }
    };

    const handleUserSignUp = async (userEmail: string) => {
        try {
            const userExistsInPool = await checkCognitoUser(userEmail);
            if (userExistsInPool) {
                Alert.alert(t('alreadyExistingUser'));
            } else {
                setLoading(true);
                await signUpUser(userEmail, generateRandomPassword(10));
                await AsyncStorage.setItem("isUserSignedIn", 'true');
                await AsyncStorage.setItem("username", userEmail.replace('@', '-at-').toLowerCase());
                await sendUserData(userEmail);
                setLoading(false);
                navigateToMain();
            }
        } catch (error) {
            console.error('Error during user sign-up:', error);
        }
    };

    const navigateToMain = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainScreen' }],
            })
        );
    };

    const registerWithEmailPassword = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!fieldsAreValid(email, password, confirmPassword, emailRegex)) {
            return;
        }

        try {
            const userExistsInPool = await checkCognitoUser(email);
            if (userExistsInPool) {
                Alert.alert(t('alreadyExistingUser'));
            } else {
                setLoading(true);
                await signUpUser(email, password);
                await AsyncStorage.setItem("isUserSignedIn", 'true');
                await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                await sendUserData(email);
                setLoading(false);
                navigateToMain();
            }
        } catch (error) {
            console.error('Error during email/password sign-up:', error);
        }
    };

    const fieldsAreValid = (email: string, password: string, confirmPassword: string, emailRegex: RegExp): boolean => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert(t('emptyAlert'));
        } else if (!emailRegex.test(email)) {
            Alert.alert(t('invalidEmailFormat'));
        } else if (password.length < 8) {
            Alert.alert(t('passwordTooShort'));
        } else if (password !== confirmPassword) {
            Alert.alert(t('nMatchPwd'));
        } else {
            return true;
        }
        return false;
    };

    const generateRandomPassword = (length: number): string => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
        return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    };

    const sendUserData = async (userEmail: string) => {
        try {
            await AsyncStorage.setItem('monthlyGenerations', '150');
            const savedMap = await AsyncStorage.getItem('ingredientsMap');
            const parsedObject = savedMap ? JSON.parse(savedMap) : {};
            const foodObject = Object.fromEntries(new Map(Object.entries(parsedObject)));
            const currentDate = new Date();
            const tokenGenerationDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
            await AsyncStorage.setItem('tokenGenerationDate', tokenGenerationDate);

            const userData = {
                userId: userEmail.replace('@', '-at-').toLowerCase(),
                food: foodObject,
                "allergies-intolerances": [...new Set(allergies)],
                "previous_recipes": [],
                vegan: dietType === 'Vegan',
                vegetarian: dietType === 'Vegetarian',
                dietType,
                equipment,
                weightUnit,
                fluidUnit,
                energyUnit,
                targetEnergy,
                targetProteinPercentage,
                targetCarbsPercentage,
                targetFatPercentage,
                monthlyGenerations,
                tokenGenerationDate
            };

            const tokenResponse = await SecurityApiService.getToken(`username=${userEmail.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse.body;
            FitMyMacrosApiService.setAuthToken(token);
            await FitMyMacrosApiService.updateUserData(userData);
        } catch (error) {
            console.error('Failed to update user data:', error);
        }
    };

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
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#DB4437' }]} onPress={promptGoogle}>
                        <View style={federatedStyles.buttonContent}>
                            <AntDesign name="google" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerGoogle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={promptFacebook}>
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
