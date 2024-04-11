import * as React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { styles } from '../styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';

interface Props {
    navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <I18nextProvider i18n={i18n}>
            <View style={styles.container}>
                <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={styles.imageBackground}>
                    <View style={styles.contentContainer}>
                        <Image source={require('../assets/images/logo.png')} style={styles.middleImage} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.buttonGreen} onPress={() => navigation.navigate('RecipeFeature')}>
                                <Text style={styles.buttonText}>{t('getStarted')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonGrey} onPress={() => navigation.navigate('SignIn')}>
                                <Text style={styles.buttonText}>{t('signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default HomeScreen;

