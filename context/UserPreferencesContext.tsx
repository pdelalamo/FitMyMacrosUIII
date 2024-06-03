import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MeasurementPreferences {
    weight: string | null;
    fluids: string | null;
}

interface UserPreferences {
    dietType: string;
    ingredientsMap: Map<string, string>;
    allergies: string[];
    equipment: string[];
    measurementPreferences: MeasurementPreferences;
}

interface UserPreferencesContextType {
    preferences: UserPreferences;
    setDietType: (diet: string) => void;
    addIngredientToMap: (key: string, value: string) => void;
    removeIngredientFromMap: (key: string) => void;
    setMeasurementPreference: (category: keyof MeasurementPreferences, preference: string) => void;
    addAllergy: (allergy: string) => void;
    removeAllergy: (allergy: string) => void;
    addEquipment: (equipment: string) => void;
    removeEquipment: (equipment: string) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
    return context;
}

interface Props {
    children: ReactNode;
}

const loadPreferences = async (): Promise<UserPreferences> => {
    const storedPreferences = await AsyncStorage.getItem('userPreferences');
    if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        parsedPreferences.ingredientsMap = new Map(Object.entries(parsedPreferences.ingredientsMap));
        return parsedPreferences;
    }
    return {
        dietType: '',
        ingredientsMap: new Map(),
        allergies: [],
        equipment: [],
        measurementPreferences: {
            weight: null,
            fluids: null,
        },
    };
};

const savePreferences = async (preferences: UserPreferences) => {
    const preferencesToStore = { ...preferences, ingredientsMap: Object.fromEntries(preferences.ingredientsMap) };
    await AsyncStorage.setItem('userPreferences', JSON.stringify(preferencesToStore));
};

export const UserPreferencesProvider: React.FC<Props> = ({ children }) => {
    const [preferences, setPreferences] = useState<UserPreferences>({
        dietType: '',
        ingredientsMap: new Map(),
        allergies: [],
        equipment: [],
        measurementPreferences: {
            weight: null,
            fluids: null,
        },
    });

    useEffect(() => {
        const loadStoredPreferences = async () => {
            const loadedPreferences = await loadPreferences();
            setPreferences(loadedPreferences);
        };

        loadStoredPreferences();
    }, []);

    useEffect(() => {
        savePreferences(preferences);
    }, [preferences]);

    const setDietType = async (diet: string) => {
        await AsyncStorage.setItem('dietType', diet);
        setPreferences(prev => ({ ...prev, dietType: diet }));
    };

    const setMeasurementPreference = (category: keyof MeasurementPreferences, preference: string) => {
        setPreferences(prev => ({
            ...prev,
            measurementPreferences: {
                ...prev.measurementPreferences,
                [category]: preference,
            },
        }));
    };

    const addIngredientToMap = async (key: string, value: string) => {
        setPreferences(prev => {
            const newMap = new Map(prev.ingredientsMap);
            newMap.set(key, value);
            return { ...prev, ingredientsMap: newMap };
        });
        try {
            const updatedMap = new Map(preferences.ingredientsMap);
            updatedMap.set(key, value);
            const mapObject = Object.fromEntries(updatedMap);
            await AsyncStorage.setItem('ingredientsMap', JSON.stringify(mapObject));
        } catch (error) {
            console.error('Error saving ingredients map to AsyncStorage:', error);
        }
    };

    const removeIngredientFromMap = (key: string) => {
        setPreferences(prev => {
            const newMap = new Map(prev.ingredientsMap);
            newMap.delete(key);
            return { ...prev, ingredientsMap: newMap };
        });
    };

    const addAllergy = async (allergy: string) => {
        const updatedAllergies = [...preferences.allergies, allergy];
        setPreferences(prev => ({ ...prev, allergies: updatedAllergies }));

        try {
            await AsyncStorage.setItem('allergiesList', JSON.stringify(updatedAllergies));
        } catch (error) {
            console.error('Error saving allergies list to AsyncStorage:', error);
        }
    };

    const removeAllergy = async (allergy: string) => {
        const updatedAllergies = preferences.allergies.filter(a => a !== allergy);
        setPreferences(prev => ({ ...prev, allergies: updatedAllergies }));

        try {
            await AsyncStorage.setItem('allergiesList', JSON.stringify(updatedAllergies));
        } catch (error) {
            console.error('Error saving allergies list to AsyncStorage:', error);
        }
    };


    const addEquipment = async (equip: string) => {
        const updatedEquipment = [...preferences.equipment, equip];
        setPreferences(prev => ({ ...prev, equipment: [...prev.equipment, equip] }));
        try {
            await AsyncStorage.setItem('equipmentList', JSON.stringify(updatedEquipment));
        } catch (error) {
            console.error('Error saving equipment list to AsyncStorage:', error);
        }
    };

    const removeEquipment = async (equip: string) => {
        const updatedEquipment = preferences.equipment.filter(a => a !== equip);
        setPreferences(prev => ({ ...prev, equipment: prev.equipment.filter(e => e !== equip) }));
        try {
            await AsyncStorage.setItem('equipmentList', JSON.stringify(updatedEquipment));
        } catch (error) {
            console.error('Error saving equipment list to AsyncStorage:', error);
        }
    };

    const value = {
        preferences,
        setDietType,
        setMeasurementPreference,
        addIngredientToMap,
        removeIngredientFromMap,
        addAllergy,
        removeAllergy,
        addEquipment,
        removeEquipment,
    };

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
};
