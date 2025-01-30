import React, { useEffect, useState } from 'react';
import { 
    View, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ImageBackground, 
    Text, 
    Alert, 
    Modal, 
    TouchableWithoutFeedback, 
    ActivityIndicator 
} from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { checkCognitoUser, signInUser, verifyEmail } from '../utils/AWSCognito';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import SecurityApiService from '../services/SecurityApiService';
import FitMyMacrosApiService from '../services/FitMyMacrosApiService';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [user, setUserInfo] = useState<any>(null);

    const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_EXPO_CLIENT_ID!,
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID!,
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID!,
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID!,
    });

    const [facebookRequest, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FB_AUTH!,
    });

    useEffect(() => {
        handleAuthResponse(googleResponse, 'Google');
    }, [googleResponse]);

    useEffect(() => {
        handleAuthResponse(facebookResponse, 'Facebook');
    }, [facebookResponse]);

    const handleAuthResponse = async (response, provider) => {
        if (response?.type === 'success') {
            const token = provider === 'Google' 
                ? response.authentication.accessToken 
                : response.authentication.accessToken;

            token && await fetchUserInfo(token, provider);
        }
    }

    const fetchUserInfo = async (token, provider) => {
        try {
            let userInfoResponse;
            if (provider === 'Google') {
                userInfoResponse = await fetch(`https://www.googleapis.com/userinfo/v2/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (provider === 'Facebook') {
                userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,email,name,picture.type(large)`);
            }

            const userInfo = await userInfoResponse.json();
            await handleLoggedInUser(userInfo);
        } catch (error) {
            console.error(`Failed to fetch user data from ${provider}:`, error);
        }
    };

    const handleLoggedInUser = async (userInfo) => {
        setUserInfo(userInfo);
        if (userInfo) {
            const userExistsInPool = await checkCognitoUser(userInfo.email);
            if (!userExistsInPool) {
                Alert.alert(t('nonExistingUser'));
            } else {
                await loginSuccess(userInfo.email);
            }
        }
    };

    const loginSuccess = async (email) => {
        setLoading(true);
        await AsyncStorage.setItem("isUserSignedIn", 'true');
        await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
        setEmail(email);
        await loadDataFromDynamoDB();
        setLoading(false);
        navigation.navigate('MainScreen');
    };

    const loginWithEmailPassword = async () => {
        const userExistsInPool = await checkCognitoUser(email);
        if (!userExistsInPool) {
            Alert.alert(t('nonExistingUser'));
        } else {
            const response = await signInUser(email, password);
            response === 'ok' ? await loginSuccess(email) : Alert.alert(t('incorrectPassword'));
        }
    };

    const loadDataFromDynamoDB = async () => {
        try {
            const tokenResponse = await SecurityApiService.getToken(`username=${email.replace('@', '-at-').toLowerCase()}`);
            const token = tokenResponse.body;
            FitMyMacrosApiService.setAuthToken(token);

            const response = await FitMyMacrosApiService.getUserData({ userId: email.replace('@', '-at-').toLowerCase() });

            if (response.statusCode === 200) {
                const userData = JSON.parse(response.body);
                await AsyncStorage.setItem("username", email.replace('@', '-at-').toLowerCase());
                // Store other required userData fields similarly
            } else {
                console.error('Failed to fetch user data', response);
            }
        } catch (error) {
            console.error('Error storing user data in AsyncStorage:', error);
        }
    };

    const resetPassword = async () => {
        const userExistsInPool = await checkCognitoUser(resetEmail);
        if (!userExistsInPool) {
            Alert.alert(t('wrongEmail'));
            return;
        }

        const cognitoUser = new CognitoUser({
            Username: resetEmail.replace('@', '-at-').toLowerCase(),
            Pool: userPool,
        });

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
        const cognitoUser = new CognitoUser({
            Username: resetEmail,
            Pool: userPool,
        });

        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess: () => {
                console.log('Password reset successfully');
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
                    <TouchableOpacity style={styles.confirmButton} onPress={loginWithEmailPassword}>
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
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#DB4437' }]} onPress={promptGoogleAsync}>
                        <View style={federatedStyles.buttonContent}>
                            <AntDesign name="google" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('signInGoogle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={promptFacebookAsync}>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
