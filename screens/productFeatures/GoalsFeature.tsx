import * as React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { styles } from '../../styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { t } from 'i18next';

interface Props {
    navigation: any;
}

const GoalsFeature: React.FC<Props> = ({ navigation }) => {
    return (
        <I18nextProvider i18n={i18n}>
            <View style={styles.container}>
                <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={styles.imageBackground}>
                    <Image source={require('../../assets/images/goals.png')} style={styles.middleImageFeatures} />
                    <View style={styles.contentContainerFeatures}>
                        <View style={styles.containerFeaturesText}>
                            <Text style={styles.featureText}>{t('goalsFeature')}</Text>
                        </View>
                        <View style={styles.buttonContainerFeatures}>
                            <TouchableOpacity style={styles.buttonGreen} onPress={() => navigation.navigate('AiFeature')}>
                                <Text style={styles.buttonText}>{t('continue')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </I18nextProvider>
    );
};

export default GoalsFeature;

