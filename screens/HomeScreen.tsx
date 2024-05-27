import * as React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.container}>
                <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                    <View style={globalStyles.contentContainer}>
                        <Image source={require('../assets/images/logo.png')} style={globalStyles.middleImage} />
                        <View style={globalStyles.buttonContainer}>
                            <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('RecipeFeature')}>
                                <Text style={globalStyles.buttonText}>{t('getStarted')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={globalStyles.buttonGrey} onPress={() => navigation.navigate('SignInScreen')}>
                                <Text style={globalStyles.buttonText}>{t('signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default HomeScreen;

