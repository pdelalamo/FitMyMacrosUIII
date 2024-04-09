import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center', // Aligns the children to the center
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between', // Distributes children evenly, aligning the first child to the start and the last child to the end
        padding: 20, // Adds padding inside the container
    },
    middleImage: {
        width: '100%', // Makes the image full width
        height: 200, // Fixed height for the image
        resizeMode: 'contain', // Ensures the image is fully visible
        alignSelf: 'center', // Centers the image
    },
    buttonContainer: {
        flexDirection: 'row', // Aligns buttons in a horizontal row
        justifyContent: 'space-around', // Distributes buttons evenly with space around them
    },
});
