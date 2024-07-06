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
    buttonGreenMarginTop: {
        backgroundColor: '#5cdb5c',
        padding: '3%',
        borderRadius: 10,
        margin: '3%',
        marginTop: '10%',
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
        marginTop: '20%'
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
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    mealsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    containerMain: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerMainGeneration: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: '5%'
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: 'white',
    },
    headerWithBackground: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: 'linear-gradient(to right, #e0f7fa, #e1bee7)', // Light gradient background
    },
    caloriesContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    caloriesText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroBox: {
        alignItems: 'center',
    },
    macroText: {
        marginTop: 5,
        fontSize: 14,
        color: '#333',
    },
    mealBox: {
        flexDirection: 'row',
        padding: 15,
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    mealCalories: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        margin: 20,
        padding: 15,
        backgroundColor: '#4caf50',
        borderRadius: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#4caf50',
    },
    modalContainerRecipe: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentRecipe: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    dropdown: {
        width: '100%',
        marginVertical: 10,
    },
    dropdownPicker: {
        zIndex: 5000, // Ensure the dropdown is on top
    },
    inputRecipe: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'white'
    },
    sliderContainer: {
        width: '100%',
        marginVertical: 10,
    },
    slider: {
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: '5%',
        color: '#333',
    },
    checkboxContainer: {
        marginTop: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandIngredientsInfo: {
        fontSize: 12,
        color: '#666',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },

});
