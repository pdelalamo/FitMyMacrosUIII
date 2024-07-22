import * as React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { globalStyles } from '../../../globalStyles';
import { productFeaturesStyles } from '../../productFeatures/productFeaturesStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    navigation: any;
}

const RestaurantRecommender: React.FC<Props> = ({ navigation }) => {
    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.container}>
                <ImageBackground source={require('../../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                    <Image source={require('../../../assets/images/restaurantFeature.png')} style={productFeaturesStyles.middleImageFeatures} />
                    <View style={productFeaturesStyles.contentContainerFeatures}>
                        <View style={productFeaturesStyles.containerFeaturesText}>
                            <Text style={productFeaturesStyles.featureText}>{t('restaurantFeature')}</Text>
                        </View>
                        <View style={globalStyles.buttonContainerFeaturesNoMargin}>
                            <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('RestaurantFormPDF')}>
                                <Text style={globalStyles.buttonText}>{t('uploadPdf')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('RestaurantForm')}>
                                <Text style={globalStyles.buttonText}>{t('restaurantRecommender')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default RestaurantRecommender;

