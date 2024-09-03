import AsyncStorage from '@react-native-async-storage/async-storage';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import SecurityApiService from 'services/SecurityApiService';

// Function to invoke when the app is first opened each day
const handleAppStart = async () => {
    const userId = await AsyncStorage.getItem('username');
    if (userId !== null) {
        const lastCheckedDate = await AsyncStorage.getItem('lastCheckedDate');
        const todayStr = new Date().toLocaleDateString('en-GB'); // Format as DD/MM/YYYY

        if (lastCheckedDate !== todayStr) {
            await checkAndUpdateTokenDate(userId);
            await AsyncStorage.setItem('lastCheckedDate', todayStr); // Store today's date
        }
    }
};

const checkAndUpdateTokenDate = async (userId: string) => {
    const tokenResponse = await SecurityApiService.getToken(`username=${userId}`);
    const token = tokenResponse.body;
    FitMyMacrosApiService.setAuthToken(token);
    const userDataResponse = await FitMyMacrosApiService.getUserData({ userId });

    // Check the status code and parse the body if the request was successful
    if (userDataResponse.statusCode === 200) {
        const userData = JSON.parse(userDataResponse.body);
        const tokenGenerationDate = userData['tokenGenerationDate'];
        const monthlyGenerations = userData['monthlyGenerations'];

        if (tokenGenerationDate && monthlyGenerations) {
            const tokenDate = parseDate(tokenGenerationDate);

            // Calculate the number of days passed since the tokenGenerationDate
            const daysPassed = calculateDaysPassed(tokenDate);

            if (daysPassed >= 30) {
                // Determine how many sets of 30 days have passed
                const setsOf30Days = Math.floor(daysPassed / 30);

                // Calculate the amount to add (150 per every 30 days)
                const generationsToAdd = setsOf30Days * 150;

                // Update the tokenGenerationDate to today's date
                const todayStr = new Date().toLocaleDateString('en-GB'); // Outputs as DD/MM/YYYY
                await AsyncStorage.setItem('tokenGenerationDate', todayStr);

                const storedMonthlyGenerations = await AsyncStorage.getItem('monthlyGenerations');
                if (storedMonthlyGenerations !== null) {
                    const newMonthlyGenerations = (parseInt(storedMonthlyGenerations, 10) + generationsToAdd).toString();
                    await AsyncStorage.setItem('monthlyGenerations', newMonthlyGenerations);
                }

                // Invoke sendUserData if 30 or more days have passed
                FitMyMacrosApiService.sendUserData();
            }
        }
    }
}


// Function to convert DD/MM/YYYY string to Date object
const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
};

const calculateDaysPassed = (tokenDate: Date): number => {
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - tokenDate.getTime();
    const daysPassed = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysPassed;
};

export { handleAppStart };
