import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ImageBackground } from 'react-native';
import { signUpUser } from '../utils/AWSCognito';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.registerContainer}>
                <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackgroundFull}>
                    <Button
                        title={showEmailPasswordFields ? t('hideEmailPassword') : t('registerEmailPwd')}
                        onPress={toggleEmailPasswordFields}
                        color="#3f51b5"
                    />
                    {showEmailPasswordFields && (
                        <>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Email"
                                onChangeText={setEmail}
                                value={email}
                            />
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Password"
                                secureTextEntry
                                onChangeText={setPassword}
                                value={password}
                            />
                        </>
                    )}
                    <Button
                        title={t('registerGoogle')}
                        onPress={registerWithGoogle}
                        color="#db4437"
                    />
                    <Button
                        title={t('registerFacebook')}
                        onPress={registerWithFacebook}
                        color="#1877f2"
                    />
                    <Button
                        title={t('registerApple')}
                        onPress={registerWithApple}
                        color="#000000"
                    />
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default RegisterScreen;
