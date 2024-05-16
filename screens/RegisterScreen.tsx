import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Text, Alert } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { checkCognitoUser, signUpUser } from '../utils/AWSCognito';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
    expoClientId: '868426694791-390ntagtjqcln514p6km7q9hr5tm0s5g.apps.googleusercontent.com',
    androidClientId: '868426694791-ij8mdj7pfb564t72mlughov5tdbf334i.apps.googleusercontent.com',
    iosClientId: '868426694791-7hkokdrjblj8juvi4qpbu2s3stgts7fo.apps.googleusercontent.com',
    webClientId: '868426694791-f8245bib57s9csg4c4ole5higbdqj2c9.apps.googleusercontent.com',
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
        clientId: "340273652494315",
    });

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
                        signUpUser(user.email, generateRandomPassword(10));
                        navigation.navigate('MainScreen');
                    }
                }
            })();
        }
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
                        signUpUser(user.email, generateRandomPassword(10));
                        navigation.navigate('MainScreen');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        }
    };

    const handleFacebookLogin = async () => {
        const result = await promptAsyncF();
        if (result.type !== "success") {
            Alert.alert('Facebook Sign-In is not available at the moment. Please try again later.');
            return;
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
            signUpUser(email, generateRandomPassword(10));
            navigation.navigate('MainScreen');
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
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={handleFacebookLogin}>
                        <View style={federatedStyles.buttonContent}>
                            <FontAwesome name="facebook" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerFacebook')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#000000' }]} onPress={handleAppleLogin}>
                        <View style={federatedStyles.buttonContent}>
                            <FontAwesome name="apple" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerApple')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
});

export default RegisterScreen;
