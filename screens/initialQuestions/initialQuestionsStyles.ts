import { StyleSheet } from 'react-native';

export const initialQuestionsStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20%',
        marginTop: '15%',
    },
    scroll: {
        marginTop: '15%',
        paddingBottom: 0
    },
    scrollViewContent: {
        flexGrow: 1
    },
    categoryTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowIcon: {
        marginLeft: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '14%',
    },
    titleIngredients: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '15%',
    },
    titleEquipment: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '10%',
    },
    titleTarget: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '10%',
        marginTop: '10%',
    },
    titleMeasurement: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '5%',
    },
    button: {
        backgroundColor: '#E0E0E0',
        padding: '3%',
        width: '100%',
        alignItems: 'center',
        marginVertical: '3%',
        borderRadius: 10,
    },
    selectedButton: {
        backgroundColor: '#f0e4af',
        padding: '3%',
        width: '100%',
        alignItems: 'center',
        marginVertical: '3%',
        borderRadius: 10,
    },
    buttonSmall: {
        backgroundColor: '#E0E0E0',
        padding: 10,
        width: '30%',
        alignItems: 'center',
        margin: '3%',
        borderRadius: 10
    },
    selectedButtonSmall: {
        backgroundColor: '#f0e4af',
        padding: 10,
        width: '30%',
        alignItems: 'center',
        margin: '2%',
        borderRadius: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10, // Adjust as needed
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
    },
    ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    ingredientText: {
        fontSize: 16,
        color: 'black'
    },
    quantityInput: {
        backgroundColor: '#F2F2F2', // Change the background color as needed
        width: 100,
        height: 40,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 16,
    },
    categoryContainer: {
        maxHeight: 400,
        overflow: 'scroll',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    sliderContainer: {
        width: '100%',
        marginBottom: 20,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sliderInput: {
        flex: 3,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 2,
        marginRight: 10,
    },
    slider: {
        flex: 4,
    },
    macroText: {
        fontSize: 16,
        marginVertical: 5,
    },
    checkboxContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
    },
    expandIngredientsInfo: {
        color: 'gray',
        fontSize: 14,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
    },
});
