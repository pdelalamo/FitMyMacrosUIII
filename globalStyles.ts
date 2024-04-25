import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    imageBackgroundFull: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#BDBDBD',
        padding: '3%',
        borderRadius: 10,
        margin: '3%',
        width: 300,
        alignSelf: 'center'
    },
    buttonText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 16
    },
    buttonContainerFeatures: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: '10%'
    },
    containerFree: {
        flex: 1,
    },
    topHalf: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40%'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    stepsContainer: {
        width: '80%',
        alignItems: 'flex-start',
    },
    featuresContainer: {
        marginTop: '3%',
        alignItems: 'flex-start',
        width: '90%'
    },
    stepText: {
        fontSize: 18,
        marginBottom: 10,
    },
    stepSubText: {
        fontSize: 12,
        marginBottom: '3%',
    },
    strikeThrough: {
        textDecorationLine: 'line-through',
    },
    bottomHalf: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trialText: {
        marginBottom: '2%',
    },
    pickPlanText: {
        marginBottom: '2%',
        fontSize: 23,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    trialButton: {
        backgroundColor: '#5cdb5c',
        paddingVertical: '4%',
        paddingHorizontal: '3%',
        borderRadius: 5,
        width: '80%'
    },
    buttonTextFree: {
        color: 'white',
        fontWeight: 'bold',
    },
    optionButton: {
        backgroundColor: 'lightblue',
        padding: '2%',
        borderRadius: 5,
    },
    continueButton: {
        backgroundColor: 'blue',
        paddingVertical: '2%',
        borderRadius: 5,
        alignItems: 'center',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '3%',
    },
    icon: {
        marginRight: '3%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: '4%',
        width: '90%',
        maxHeight: '90%',
    },
    subscriptionOptions: {
        marginTop: '5%',
        marginBottom: '5%',
    },
    subscriptionOption: {
        backgroundColor: '#f0f0f0',
        padding: '4%',
        borderRadius: 5,
        marginBottom: '3%',
    },
    subscriptionTitle: {
        fontWeight: 'bold',
        marginBottom: '2%',
    },
    subscriptionPrice: {
        color: '#555',
    },
    selectedSubscriptionOption: {
        backgroundColor: '#65C6F0',
        borderColor: '#65C6F0',
    },
    registerContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    input: {
        width: '80%',
        height: '6%',
        marginBottom: '3%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: '2%'
    },
});
