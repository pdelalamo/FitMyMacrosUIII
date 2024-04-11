import { StyleSheet } from 'react-native';

export const productFeaturesStyles = StyleSheet.create({
    contentContainerFeatures: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
    },
    containerFeaturesText: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 0,
        width: '70%',
        marginTop: '-15%'
    },
    middleImageFeatures: {
        flex: 0.8,
        width: '100%',
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: '35%',
        marginBottom: 0,
        padding: 0
    },
    featureText: {
        textAlign: 'center',
        fontSize: 18
    }
});
