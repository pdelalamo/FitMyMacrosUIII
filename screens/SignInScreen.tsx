import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Text, Alert, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { checkCognitoUser, signInUser, signUpUser, verifyEmail } from '../utils/AWSCognito';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import SecurityApiService from '../services/SecurityApiService';
import FitMyMacrosApiService from '../services/FitMyMacrosApiService';

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

const poolData = {
    UserPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID!,
    ClientId: process.env.EXPO_PUBLIC_AWS_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

const SignInScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEmailPasswordFields, setShowEmailPasswordFields] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [user, setUserInfo] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest(config);
    const [requestF, responseF, promptAsyncF] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FB_AUTH!,
    });

    useEffect(() => {
        console.log('useEffect triggered with response:', response);
        if (response) {
            handleGoogleSignIn();
        }
    }, [response]);

    async function handleGoogleSignIn() {
        try {
            if (response?.type === 'success' && response.authentication) {
                console.log("response token : " + response.authentication.accessToken);
                setGoogleAccessToken(response.authentication.accessToken);
                await fetchUserInfo(response.authentication.accessToken);
            } else {
                console.log('Google sign-in not successful or no authentication response ');
            }
        } catch (error) {
            console.error('Error in handleGoogleSignIn:', error);
        }
    };

    const fetchUserInfo = async (token: string) => {
        if (token) {
            try {
                const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userInfo = await response.json();
                await AsyncStorage.setItem("@user", JSON.stringify(userInfo));
                setUserInfo(userInfo);
                console.log("email from user from google: " + userInfo.email);
                if (userInfo) {
                    const userExistsInPool = await checkCognitoUser(userInfo.email);
                    if (!userExistsInPool) {
                        Alert.alert(t('nonExistingUser'));
                    } else {
                        setLoading(true);
                        await setEmail(userInfo.email);
                        await AsyncStorage.setItem("isUserSignedIn", 'true');
                        await AsyncStorage.setItem("username", userInfo.email.replace('@', '-at-').toLowerCase());
                        setEmail(userInfo.email);
                        await loadDataFromDynamoDB();
                        setLoading(false);
                        navigation.navigate('MainScreen');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        }
    };

    useEffect(() => {
        handleFacebookLogin();
    }, [responseF]);

    async function handleFacebookLogin() {
        try {
            if (responseF?.type === 'success' && responseF.authentication) {
                const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${responseF.authentication?.accessToken}&fields=id,email,name,picture.type(large)`);
                const userInfo = await userInfoResponse.json();
                setUserInfo(userInfo);
                if (userInfo) {
                    const userExistsInPool = await checkCognitoUser(userInfo.email); // Changed user.email to userInfo.email
                    if (!userExistsInPool) {
                        Alert.alert(t('nonExistingUser'));
                    } else {
                        setLoading(true);
                        await setEmail(userInfo.email);
                        await AsyncStorage.setItem("isUserSignedIn", 'true');
                        await AsyncStorage.setItem("username", userInfo.email.replace('@', '-at-').toLowerCase());
                        setEmail(userInfo.email);
                        await loadDataFromDynamoDB();
                        setLoading(false);
                        navigation.navigate('MainScreen');
                    }
                }
            }
        } catch (error) {
            console.error('Error during Facebook login:', error);
        }
    }

    const handleAppleLogin = async () => {
        // Implement Apple Sign-In and federatedSignIn with AWS Cognito
    };

    async function loginWithEmailPassword() {
        const userExistsInPool = await checkCognitoUser(email);
        if ((!userExistsInPool)) {
            Alert.alert(t('nonExistingUser'));
        } else {
            const response = await signInUser(email, password);
            if ((response === 'ok')) {
                setLoading(true);
                await AsyncStorage.setItem("isUserSignedIn", 'true');
                await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                await loadDataFromDynamoDB();
                setLoading(false);
                navigation.navigate('MainScreen');
            } else {
                Alert.alert(t('incorrectPassword'));
            }
        }
    };

    async function loadDataFromDynamoDB() {
        try {
            console.log(email);
            const tokenResponse = await SecurityApiService.getToken(`username=${email.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse.body;
            FitMyMacrosApiService.setAuthToken(token);
            console.log("calling with email: " + email);
            const userId = email.replace('@', '-at-').toLowerCase()
            const userDataResponse = await FitMyMacrosApiService.getUserData({ userId });

            // Check the status code and parse the body if the request was successful
            if (userDataResponse.statusCode === 200) {
                const userData = JSON.parse(userDataResponse.body);

                for (const key in userData) {
                    console.log('userdata entry key: ' + key + ': ' + userData[key]);
                }

                await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                await AsyncStorage.setItem('ingredientsMap', !!JSON.stringify(userData['food']) ? JSON.stringify(userData['food']) : '');
                await AsyncStorage.setItem('allergiesList', !!JSON.stringify(userData['allergies-intolerances']) ? JSON.stringify(userData['allergies-intolerances']) : '');
                await AsyncStorage.setItem('dietType', userData['dietType']);
                await AsyncStorage.setItem('equipmentList', JSON.stringify(userData['equipment']));
                await AsyncStorage.setItem('measurementEnergy', userData['energyUnit']);
                await AsyncStorage.setItem('measurementSolid', userData['weightUnit']);
                await AsyncStorage.setItem('measurementFluid', userData['fluidUnit']);
                await AsyncStorage.setItem('favoriteMeals', !!JSON.stringify(userData['favoriteMeals']) ? JSON.stringify(userData['favoriteMeals']) : '');
                await AsyncStorage.setItem('previous_recipes', !!JSON.stringify(userData['previous_recipes']) ? JSON.stringify(userData['previous_recipes']) : '');
                await AsyncStorage.setItem('targetCalories', userData['targetEnergy']);
                await AsyncStorage.setItem('proteinPercentage', userData['targetProteinPercentage']);
                await AsyncStorage.setItem('carbsPercentage', userData['targetCarbsPercentage']);
                await AsyncStorage.setItem('fatPercentage', userData['targetFatPercentage']);
                await AsyncStorage.setItem('monthlyGenerations', (userData['monthlyGenerations'] === null || userData['monthlyGenerations'] === '' || userData['monthlyGenerations'] === undefined) ? '150' : userData['monthlyGenerations']);
                await AsyncStorage.setItem('tokenGenerationDate', (userData['tokenGenerationDate'] === null || userData['tokenGenerationDate'] === '' || userData['tokenGenerationDate'] === undefined) ? new Date().toLocaleDateString('en-GB') : userData['tokenGenerationDate']);
            } else {
                console.error('Failed to fetch user data', userDataResponse);
            }

        } catch (error) {
            console.error('Error storing user data in AsyncStorage:', error);
        }
    }

    async function resetPassword() {
        const userExistsInPool = await checkCognitoUser(resetEmail);
        if ((!userExistsInPool)) {
            Alert.alert(t('wrongEmail'));
            return
        }
        const userData = {
            Username: resetEmail.replace('@', '-at-').toLowerCase(),
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);
        const verified = await verifyEmail(resetEmail);

        if (verified) {
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    console.log('Password reset code sent:', data);
                    Alert.alert(t('succesfulReset'));
                    setIsCodeSent(true);
                },
                onFailure: (err) => {
                    console.error('Password reset failed:', err);
                    Alert.alert(t('passResetError'), err.message || JSON.stringify(err));
                    setModalVisible(false);
                },
            });
        } else {
            Alert.alert(t('passResetError'));
        }
    };

    const confirmNewPassword = async () => {
        const userData = {
            Username: resetEmail,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess: (result) => {
                console.log('Password reset successfully:', result);
                Alert.alert('Password reset successfully!');
                setModalVisible(false);
                setIsCodeSent(false);
            },
            onFailure: (err) => {
                console.log('Password reset confirmation failed:', err);
                Alert.alert('Password reset confirmation failed', err.message || JSON.stringify(err));
            },
        });
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
                    <TouchableOpacity style={styles.confirmButton} onPress={() => { loginWithEmailPassword() }}>
                        <Text style={styles.confirmButtonText}>{t('signInEmailPwd')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.resetButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.resetButtonText}>{t('resetPassword')}</Text>
                    </TouchableOpacity>
                    <View style={federatedStyles.separator}>
                        <View style={federatedStyles.line} />
                        <Text style={federatedStyles.orText}>{t('or')}</Text>
                        <View style={federatedStyles.line} />
                    </View>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#DB4437' }]} onPress={() => { promptAsync() }}>
                        <View style={federatedStyles.buttonContent}>
                            <AntDesign name="google" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('signInGoogle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={() => { promptAsyncF() }}>
                        <View style={federatedStyles.buttonContent}>
                            <FontAwesome name="facebook" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('signInFacebook')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {!isCodeSent ? (
                            <>
                                <Text style={styles.modalText}>{t('resetPassword')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('email')}
                                    onChangeText={setResetEmail}
                                    value={resetEmail}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={resetPassword}
                                >
                                    <Text style={styles.textStyle}>{t('sendCode')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalText}>{t('enterCodeNewPassword')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('verificationCode')}
                                    onChangeText={setVerificationCode}
                                    value={verificationCode}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('newPassword')}
                                    secureTextEntry
                                    onChangeText={setNewPassword}
                                    value={newPassword}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={confirmNewPassword}
                                >
                                    <Text style={styles.textStyle}>{t('changePassword')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => { setModalVisible(!modalVisible), setIsCodeSent(false) }}
                        >
                            <Text style={styles.textStyle}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <TouchableWithoutFeedback>
                        <BlurView intensity={50} style={styles.blurView}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </BlurView>
                    </TouchableWithoutFeedback>
                </View>
            )}
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
    resetButton: {
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#BDBDBD',
    },
    resetButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '60%',
        width: '70%',
    },
    button: {
        width: '80%',
        height: '15%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        width: '80%',
        height: '15%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        width: '80%',
        height: '20%',
        marginBottom: '3%',
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

export default SignInScreen;