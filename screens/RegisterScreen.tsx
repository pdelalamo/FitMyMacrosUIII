import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Text, Alert } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { federatedStyles } from '../federatedStyles';
import { signUpUser } from '../utils/AWSCognito';

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEmailPasswordFields, setShowEmailPasswordFields] = useState(false);

    const toggleEmailPasswordFields = () => {
        setShowEmailPasswordFields(!showEmailPasswordFields);
    };

    const registerWithGoogle = async () => {
        // Implement Google Sign-In and federatedSignIn with AWS Cognito
    };

    const registerWithFacebook = async () => {
        // Implement Facebook Sign-In and federatedSignIn with AWS Cognito
    };

    const registerWithApple = async () => {
        // Implement Apple Sign-In and federatedSignIn with AWS Cognito
    };

    const registerWithEmailPassword = () => {
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
        else if (password !== confirmPassword) {
            Alert.alert(t('nMatchPwd'));
            return;
        }
        signUpUser(email, password);
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
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#DB4437' }]} onPress={registerWithGoogle}>
                        <View style={federatedStyles.buttonContent}>
                            <AntDesign name="google" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerGoogle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#1877f2' }]} onPress={registerWithFacebook}>
                        <View style={federatedStyles.buttonContent}>
                            <FontAwesome name="facebook" size={24} color="#fff" style={federatedStyles.icon} />
                            <Text style={federatedStyles.buttonText}>{t('registerFacebook')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[federatedStyles.button, { backgroundColor: '#000000' }]} onPress={registerWithApple}>
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
