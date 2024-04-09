import * as React from 'react';
import { View, Image, ImageBackground, Button, Alert } from 'react-native';
import { styles } from '../styles';

interface Props {
    navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/images/main_background.png')} resizeMode="cover" style={styles.imageBackground}>
                <View style={styles.contentContainer}>
                    <Image source={require('../assets/images/logo.png')} style={styles.middleImage} />
                    <View style={styles.buttonContainer}>
                        <Button title="Get Started" onPress={() => Alert.alert('Button 1 pressed')} />
                        <Button title="Already an user? Sign in" onPress={() => navigation.navigate('SignIn')} />
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

export default HomeScreen;
