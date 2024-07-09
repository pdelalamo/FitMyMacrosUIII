import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f5f0',
    },
    containerSettings: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20%',
        marginTop: '15%',
    },
    scrollContainer: {
        flex: 1,
    },
    option: {
        backgroundColor: '#fff', // White background for options
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 2,
    },
    optionText: {
        fontSize: 18,
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
        marginBottom: 50,
    },
    arrowIcon: {
        marginLeft: 5,
    },
    titleIngredients: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '15%',
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
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
    },
    quantityInput: {
        backgroundColor: '#F2F2F2', // Change the background color as needed
        width: 100,
        height: 40,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '14%',
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
    titleEquipment: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '10%',
    },
    titleMeasurement: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '5%',
    },
    titleTarget: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '10%',
        marginTop: '10%',
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
