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
        marginBottom: 20,
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
    }
});
