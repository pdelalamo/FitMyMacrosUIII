import React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import { globalStyles } from '../../../globalStyles';
import { productFeaturesStyles } from '../../productFeatures/productFeaturesStyles';
import Footer from 'utils/Footer';
import { t } from 'i18next';

interface Props {
  navigation: any;
}

const RestaurantRecommender: React.FC<Props> = ({ navigation }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <View style={globalStyles.container}>
        <ImageBackground
          source={require('../../../assets/images/main_background.png')}
          resizeMode="cover"
          style={globalStyles.imageBackground}
        >
          <Image
            source={require('../../../assets/images/restaurantFeature.png')}
            style={productFeaturesStyles.middleImageFeatures}
          />
          <View style={productFeaturesStyles.contentContainerFeatures}>
            {renderFeatureText()}
            {renderFeatureButtons(navigation)}
          </View>
        </ImageBackground>
        <Footer navigation={navigation} />
      </View>
    </I18nextProvider>
  );
};

const renderFeatureText = () => (
  <View style={productFeaturesStyles.containerFeaturesText}>
    <Text style={productFeaturesStyles.featureText}>{t('restaurantFeature')}</Text>
  </View>
);

const renderFeatureButtons = (navigation: any) => (
  <View style={globalStyles.buttonContainerFeaturesNoMargin}>
    {renderButton(t('uploadPdf'), () => navigation.navigate('RestaurantFormPDF'))}
    {renderButton(t('restaurantRecommender'), () => navigation.navigate('RestaurantForm'))}
  </View>
);

const renderButton = (text: string, onPress: () => void) => (
  <TouchableOpacity style={globalStyles.buttonGreen} onPress={onPress}>
    <Text style={globalStyles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export default RestaurantRecommender;
