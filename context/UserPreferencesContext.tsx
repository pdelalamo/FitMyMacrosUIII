import React, { createContext, useState, useContext, ReactNode } from 'react';

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

export const UserPreferencesProvider: React.FC<Props> = ({ children }) => {
    const [dietType, setDietType] = useState<string>('');
    const [ingredientsMap, setIngredientsMap] = useState<Map<string, string>>(new Map());
    const [allergies, setAllergies] = useState<string[]>([]);
    const [equipment, setEquipment] = useState<string[]>([]);
    const [measurementPreferences, setMeasurementPreferences] = useState<MeasurementPreferences>({
        weight: null,
        fluids: null,
    });

    const setMeasurementPreference = (category: keyof MeasurementPreferences, preference: string) => {
        setMeasurementPreferences(prev => ({
            ...prev,
            [category]: preference,
        }));
    };

    const addIngredientToMap = (key: string, value: string) => {
        setIngredientsMap(prev => new Map(prev).set(key, value));
    };

    const removeIngredientFromMap = (key: string) => {
        setIngredientsMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    };

    const addAllergy = (allergy: string) => {
        setAllergies(prev => [...prev, allergy]);
    };

    const removeAllergy = (allergy: string) => {
        setAllergies(prev => prev.filter(a => a !== allergy));
    };

    const addEquipment = (equip: string) => {
        setEquipment(prev => [...prev, equip]);
    };

    const removeEquipment = (equip: string) => {
        setEquipment(prev => prev.filter(e => e !== equip));
    };

    const value = {
        preferences: {
            dietType,
            measurementPreferences,
            ingredientsMap,
            allergies,
            equipment,
        },
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
