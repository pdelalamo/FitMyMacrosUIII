import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ImageBackground, TouchableWithoutFeedback, Platform, Alert } from 'react-native';
import { globalStyles } from '../globalStyles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { t } from 'i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { constants } from '../utils/constants';

interface Props {
    navigation: any;
}

const FreeTrialScreen: React.FC<Props> = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(true);
    const isIOSEmulator = Platform.OS === 'ios' && Platform.constants.interfaceIdiom === 'handset';

    const isAndroidEmulator = Platform.OS === 'android' && (
        Platform.constants.Model.includes('sdk') || 
        Platform.constants.Manufacturer.toLowerCase() === 'generic'
    );

    const handleOptionPress = (option: string) => {
        setSelectedOption(option);
    };

    function setPurchaseLoading(arg0: boolean) {
        throw new Error('Function not implemented.');
    }

    const notifySuccessfulPurchase = () => {
        Alert.alert("Success", "Purchase successful", [
            {
                text: 'Logins',
                onPress: () => navigation.navigate('Login')
            }
        ])
    }

    const handlePurchase = async (productId: string | null) => {
        if (productId === null) {
            Alert.alert('Please, select one plan')
        }
        else {
            setModalVisible(false);
            setLoading(true)
            finally {
                setLoading(false);
            }
        }
    }

    return (
        <I18nextProvider i18n={i18n}>
            <View style={globalStyles.containerFree}>
                <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                    <View style={globalStyles.topHalf}>
                        <Text style={globalStyles.title}>{t('unlockFree')}</Text>
                        <View style={globalStyles.stepsContainer}>
                            <View style={globalStyles.stepContainer}>
                                <Icon name="check" size={20} color="green" style={globalStyles.icon} />
                                <View>
                                    <Text style={[globalStyles.stepText, globalStyles.strikeThrough]}>{t('setUpDietary')}</Text>
                                    <Text style={globalStyles.stepSubText}>{t('setUpDietarySubText')}</Text>
                                </View>
                            </View>
                            <View style={globalStyles.stepContainer}>
                                <Icon name="play" size={20} color="#65C6F0" style={globalStyles.icon} />
                                <View>
                                    <Text style={globalStyles.stepText}>{t('today')}</Text>
                                    <Text style={globalStyles.stepSubText}>{t('todaySubtext')}</Text>
                                </View>
                            </View>
                            <View style={globalStyles.stepContainer}>
                                <Icon name="bell" size={20} color="#65C6F0" style={globalStyles.icon} />
                                <View>
                                    <Text style={globalStyles.stepText}>{t('reminder')}</Text>
                                    <Text style={globalStyles.stepSubText}>{t('reminderSubText')}</Text>
                                </View>
                            </View>
                            <View style={globalStyles.stepContainer}>
                                <Icon name="star" size={20} color="#65C6F0" style={globalStyles.icon} />
                                <View>
                                    <Text style={globalStyles.stepText}>{t('endFreeTrial')}</Text>
                                    <Text style={globalStyles.stepSubText}>{t('endFreeTrialSubText')}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={globalStyles.bottomHalf}>
                        <Text style={globalStyles.trialText}>{t('7DaysFree')}</Text>
                        <TouchableOpacity style={globalStyles.trialButton} onPress={() => setModalVisible(true)}>
                            <Text style={globalStyles.buttonText}>{t('startFree')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('RegisterScreen')}>
                            <Text style={globalStyles.buttonText}>{t('skip')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}>
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={[globalStyles.modalContainer, { justifyContent: 'flex-end' }]}>
                                <View style={[globalStyles.modalContent, { height: '50%' }]}>
                                    <Text style={globalStyles.pickPlanText}>{t('pickPlan')}</Text>
                                    <View style={globalStyles.featuresContainer}>
                                        <View style={globalStyles.stepContainer}>
                                            <Icon name="check" size={20} color="#65C6F0" style={globalStyles.icon} />
                                            <Text>{t('feature1')}</Text>
                                        </View>
                                        <View style={globalStyles.stepContainer}>
                                            <Icon name="check" size={20} color="#65C6F0" style={globalStyles.icon} />
                                            <Text>{t('feature2')}</Text>
                                        </View>
                                        <View style={globalStyles.stepContainer}>
                                            <Icon name="check" size={20} color="#65C6F0" style={globalStyles.icon} />
                                            <Text>{t('feature3')}</Text>
                                        </View>
                                    </View>
                                    <View style={globalStyles.subscriptionOptions}>
                                        <TouchableOpacity
                                            style={[
                                                globalStyles.subscriptionOption,
                                                selectedOption === 'monthly' && globalStyles.selectedSubscriptionOption,
                                            ]}
                                            onPress={() => handleOptionPress('monthly')}
                                        >
                                            <Text style={globalStyles.subscriptionTitle}>{t('monthly')}</Text>
                                            <Text style={globalStyles.subscriptionPrice}>{t('monthlyPrice')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                globalStyles.subscriptionOption,
                                                selectedOption === 'yearly' && globalStyles.selectedSubscriptionOption,
                                            ]}
                                            onPress={() => handleOptionPress('yearly')}
                                        >
                                            <Text style={globalStyles.subscriptionTitle}>{t('yearly')}</Text>
                                            <Text style={globalStyles.subscriptionPrice}>{t('yearlyPrice')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => handlePurchase(selectedOption)}>
                                        <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </ImageBackground>
            </View>
        </I18nextProvider >
    );
};

export default FreeTrialScreen;

