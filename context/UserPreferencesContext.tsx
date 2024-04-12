import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserPreferences {
    dietType: string;
    ingredientsMap: Map<string, string>;
}

interface UserPreferencesContextType {
    preferences: UserPreferences;
    setDietType: (diet: string) => void;
    addIngredientToMap: (key: string, value: string) => void;
    removeIngredientFromMap: (key: string) => void;
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

    const value = {
        preferences: {
            dietType,
            ingredientsMap
        },
        setDietType,
        addIngredientToMap,
        removeIngredientFromMap
    };

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
};
