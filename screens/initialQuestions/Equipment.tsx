import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { globalStyles } from '../../globalStyles';
import { initialQuestionsStyles } from './initialQuestionsStyles';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { t } from 'i18next';

const equipmentOptions: string[] = t('equipmentOptions', { returnObjects: true });

interface Props {
    navigation: any;
}

const EquipmentSelection: React.FC<Props> = ({ navigation }) => {
    const { addEquipment, removeEquipment } = useUserPreferences();
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const { t } = useTranslation();

    const handleSelectEquipment = (equipment: string) => {
        if (selectedEquipment.includes(equipment)) {
            setSelectedEquipment(prev => prev.filter(item => item !== equipment));
            removeEquipment(equipment);
        } else {
            setSelectedEquipment(prev => [...prev, equipment]);
            addEquipment(equipment);
        }
    };

    const renderEquipmentButtons = () => {
        const buttons = [];
        for (let i = 0; i < equipmentOptions.length; i += 2) {
            const firstEquipment = equipmentOptions[i];
            const secondEquipment = equipmentOptions[i + 1];
            buttons.push(
                <View style={initialQuestionsStyles.rowContainer} key={i}>
                    <TouchableOpacity
                        style={[
                            initialQuestionsStyles.buttonSmall,
                            selectedEquipment.includes(firstEquipment) ? initialQuestionsStyles.selectedButtonSmall : null,
                        ]}
                        onPress={() => handleSelectEquipment(firstEquipment)}
                    >
                        <Text style={globalStyles.buttonText}>{firstEquipment}</Text>
                    </TouchableOpacity>
                    {secondEquipment && (
                        <TouchableOpacity
                            style={[
                                initialQuestionsStyles.buttonSmall,
                                selectedEquipment.includes(secondEquipment) ? initialQuestionsStyles.selectedButtonSmall : null,
                            ]}
                            onPress={() => handleSelectEquipment(secondEquipment)}
                        >
                            <Text style={globalStyles.buttonText}>{secondEquipment}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return buttons;
    };

    return (
        <I18nextProvider i18n={i18n}>
            <ImageBackground source={require('../../assets/images/main_background.png')} resizeMode="cover" style={globalStyles.imageBackground}>
                <View style={initialQuestionsStyles.container}>
                    <Text style={initialQuestionsStyles.titleEquipment}>{t('selectEquipment')}</Text>
                    {renderEquipmentButtons()}
                    <View style={globalStyles.buttonContainerFeatures}>
                        <TouchableOpacity style={globalStyles.buttonGreen} onPress={() => navigation.navigate('TargetCaloriesAndMacros')}>
                            <Text style={globalStyles.buttonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </I18nextProvider>
    );
};

export default EquipmentSelection;
