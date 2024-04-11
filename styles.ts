import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
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
    contentContainerBottom: {
        position: 'absolute',
        bottom: '8%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    middleImage: {
        width: '100%',
        height: '50%',
        resizeMode: 'contain',
        alignSelf: 'center',
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
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    buttonContainerFeatures: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: '10%'
    },
    buttonGreen: {
        backgroundColor: 'green',
        padding: '3%',
        borderRadius: 10,
        margin: '3%',
        width: 300,
        alignSelf: 'center'
    },
    buttonGrey: {
        backgroundColor: 'grey',
        padding: '3%',
        borderRadius: 10,
        margin: '3%',
        width: 300,
        alignSelf: 'center'
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20
    },
    featureText: {
        textAlign: 'center',
        fontSize: 18
    },
});
