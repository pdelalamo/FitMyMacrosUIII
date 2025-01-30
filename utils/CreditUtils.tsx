import AsyncStorage from '@react-native-async-storage/async-storage';
import FitMyMacrosApiService from 'services/FitMyMacrosApiService';
import SecurityApiService from 'services/SecurityApiService';

// Constants
const DAYS_IN_MONTH = 30;
const GENERATIONS_INCREMENT = 150;
const DATE_FORMAT = 'en-GB';

// Function to invoke when the app is first opened each day
const handleAppStart = async () => {
    try {
        const userId = await getUserId();
        if (userId) {
            const lastCheckedDate = await getStoredDate('lastCheckedDate');
            const todayDate = formatDate(new Date());

            if (lastCheckedDate !== todayDate) {
                await updateTokenAndGenerations(userId);
                await setStoredDate('lastCheckedDate', todayDate);
            }
        }
    } catch (error) {
        console.error('Error during app start:', error);
    }
};

const getUserId = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('username');
};

const getStoredDate = async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
};

const setStoredDate = async (key: string, date: string): Promise<void> => {
    await AsyncStorage.setItem(key, date);
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString(DATE_FORMAT);
};

const updateTokenAndGenerations = async (userId: string) => {
    const token = await fetchAuthToken(userId);
    if (token) {
        FitMyMacrosApiService.setAuthToken(token);
        const userData = await fetchUserData(userId);

        if (userData) {
            const { tokenGenerationDate, monthlyGenerations } = userData;
            await updateGenerationsIfNeeded(tokenGenerationDate, monthlyGenerations);
        }
    }
};

const fetchAuthToken = async (userId: string): Promise<string | null> => {
    const tokenResponse = await SecurityApiService.getToken(`username=${userId}`);
    return tokenResponse ? tokenResponse.body : null;
};

const fetchUserData = async (userId: string): Promise<any> => {
    const userDataResponse = await FitMyMacrosApiService.getUserData({ userId });
    return userDataResponse.statusCode === 200 ? JSON.parse(userDataResponse.body) : null;
};

const updateGenerationsIfNeeded = async (tokenDateStr: string, storedGenerations: string) => {
    const tokenDate = parseDate(tokenDateStr);
    const daysPassed = calculateDaysPassed(tokenDate);

    if (daysPassed >= DAYS_IN_MONTH) {
        const generationsToAdd = calculateGenerationsToAdd(daysPassed);
        const newTokenDate = formatDate(new Date());

        await setStoredDate('tokenGenerationDate', newTokenDate);
        await updateMonthlyGenerations(generationsToAdd, storedGenerations);
        FitMyMacrosApiService.sendUserData();
    }
};

const calculateGenerationsToAdd = (daysPassed: number): number => {
    const setsOfDays = Math.floor(daysPassed / DAYS_IN_MONTH);
    return setsOfDays * GENERATIONS_INCREMENT;
};

const updateMonthlyGenerations = async (generationsToAdd: number, storedGenerationsStr: string) => {
    const storedGenerations = parseInt(storedGenerationsStr, 10);
    const newMonthlyGenerations = (storedGenerations + generationsToAdd).toString();
    await AsyncStorage.setItem('monthlyGenerations', newMonthlyGenerations);
};

const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
};

const calculateDaysPassed = (tokenDate: Date): number => {
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - tokenDate.getTime();
    return Math.floor(timeDifference / (1000 * 3600 * 24));
};

export { handleAppStart };
