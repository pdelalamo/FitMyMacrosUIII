import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ImageBackground } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { t } from 'i18next';
import { globalStyles } from 'globalStyles';
import i18n from 'i18n';

interface Props {
    navigation: any;
}

const MainScreen: React.FC<Props> = ({ navigation }) => {

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default MainScreen;
