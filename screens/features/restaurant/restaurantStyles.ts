import { StyleSheet } from 'react-native';

export const restaurantStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#388E3C',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
    },
    pdfInfo: {
        marginTop: 10,
        color: '#388E3C',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 1,
    },
    optionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 10,
    },
    macroContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    macroLabel: {
        fontWeight: 'bold',
        color: '#388E3C',
    },
    macroValue: {
        color: '#555',
    },
});
