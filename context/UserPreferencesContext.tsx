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

    const setDietType = (diet: string) => {
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

    const addIngredientToMap = (key: string, value: string) => {
        setPreferences(prev => {
            const newMap = new Map(prev.ingredientsMap);
            newMap.set(key, value);
            return { ...prev, ingredientsMap: newMap };
        });
    };

    const removeIngredientFromMap = (key: string) => {
        setPreferences(prev => {
            const newMap = new Map(prev.ingredientsMap);
            newMap.delete(key);
            return { ...prev, ingredientsMap: newMap };
        });
    };

    const addAllergy = (allergy: string) => {
        setPreferences(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
    };

    const removeAllergy = (allergy: string) => {
        setPreferences(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== allergy) }));
    };

    const addEquipment = (equip: string) => {
        setPreferences(prev => ({ ...prev, equipment: [...prev.equipment, equip] }));
    };

    const removeEquipment = (equip: string) => {
        setPreferences(prev => ({ ...prev, equipment: prev.equipment.filter(e => e !== equip) }));
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
