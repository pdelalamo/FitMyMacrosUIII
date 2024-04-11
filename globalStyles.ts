import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    buttonGreen: {
        backgroundColor: '#5cdb5c',
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
    buttonContainerFeatures: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: '10%'
    },
});
