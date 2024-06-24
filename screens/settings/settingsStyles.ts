import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f5f0', // Light green background
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
});
