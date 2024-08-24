import { StyleSheet } from 'react-native';

export const featuresStyles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        minHeight: 120,
        justifyContent: 'center',
    },
    recipeName: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    recipeDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    generateButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    listContent: {
        paddingBottom: 100,
    },
    headerContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    titleContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recipeName2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        flex: 1,
    },
    cookingTime: {
        fontSize: 16,
        color: '#777',
        marginTop: 10,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    macrosText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    sectionContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
    },
    ingredientContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    ingredientName: {
        fontSize: 16,
        color: '#333',
    },
    ingredientQuantity: {
        fontSize: 16,
        color: '#666',
    },
    stepContainer: {
        marginVertical: 5,
    },
    stepText: {
        fontSize: 16,
        color: '#333',
    },
    backButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 60,
        marginHorizontal: 20,
    },
});
