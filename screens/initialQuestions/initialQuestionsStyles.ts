import { StyleSheet } from 'react-native';

export const initialQuestionsStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: '15%'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: '3%',
        marginTop: '15%',
    },
    button: {
        backgroundColor: '#E0E0E0',
        padding: 10,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 10,
    },
    selectedButton: {
        backgroundColor: '#f0e4af',
        padding: 10,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
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
        backgroundColor: '#FFFFFF', // Change the background color as needed
        width: 100,
        height: 40,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 16,
    }
});
