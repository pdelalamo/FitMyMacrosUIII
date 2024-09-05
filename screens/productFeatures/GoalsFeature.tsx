import * as React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { productFeaturesStyles } from './productFeaturesStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';

interface Props {
    navigation: any;
}

const GoalsFeature: React.FC<Props> = ({ navigation }) => {
    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.container}>
                <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                    <Image source={require('../../assets/images/goals.png')} style={productFeaturesStyles.middleImageFeatures} />
                    <View style={productFeaturesStyles.contentContainerFeatures}>
                        <View style={productFeaturesStyles.containerFeaturesText}>
                            <Text style={productFeaturesStyles.featureText}>{t('goalsFeature')}</Text>
                        </View>
                        <View style={globalStyles.buttonContainerFeatures}>
                            <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('RestaurantFeature')}>
                                <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default GoalsFeature;

