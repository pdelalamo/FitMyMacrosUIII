import AsyncStorage from "@react-native-async-storage/async-storage";


function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const normalizeUnit = (value: any) => {
    if (typeof value !== 'string') return value;

    const replacements = [
        { long: 'grams', short: 'g' },
        { long: 'ounces', short: 'oz' },
    ];

    let normalizedValue = value;
    replacements.forEach(replacement => {
        normalizedValue = normalizedValue.replace(new RegExp(replacement.long, 'gi'), replacement.short);
    });

    return normalizedValue;
};

const getWeightPreference = async () => {
    const storedPreferences = await AsyncStorage.getItem('userPreferences');
    if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        return parsedPreferences.measurementPreferences.weight;
    }
    return null;
};

function removeLeadingTrailingCommasAndQuotes(str: String) {
    // Trim leading and trailing whitespace
    let cleanedResponse = str.trim();

    // Check if the response starts with "json" and remove it
    if (cleanedResponse.startsWith('json')) {
        cleanedResponse = cleanedResponse.substring(4).trim();
    }

    // Remove any leading or trailing commas, backticks, or single quotes
    cleanedResponse = cleanedResponse.replace(/^[\s,`']+|[\s,`']+$/g, '');

    const index = cleanedResponse.indexOf('{');
    if (index !== -1) {
        return cleanedResponse.substring(index);
    }
    return cleanedResponse;
}

export { generateRandomString, getWeightPreference, removeLeadingTrailingCommasAndQuotes, normalizeUnit };
