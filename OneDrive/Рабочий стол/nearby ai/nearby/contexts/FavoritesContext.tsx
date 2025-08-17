import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApprovedBusiness } from '@/types';

interface FavoritesContextType {
    favorites: ApprovedBusiness[];
    addToFavorites: (place: ApprovedBusiness) => Promise<void>;
    removeFromFavorites: (placeId: string) => Promise<void>;
    isFavorite: (placeId: string) => boolean;
    toggleFavorite: (place: ApprovedBusiness) => Promise<void>;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: React.ReactNode;
}

const FAVORITES_STORAGE_KEY = '@nearby_favorites';

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favorites, setFavorites] = useState<ApprovedBusiness[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Загружаем избранные места при инициализации
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            if (storedFavorites) {
                const parsedFavorites = JSON.parse(storedFavorites);
                setFavorites(parsedFavorites);
                console.log('✅ Loaded favorites:', parsedFavorites.length, 'places');
            }
        } catch (error) {
            console.error('❌ Error loading favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveFavorites = async (newFavorites: ApprovedBusiness[]) => {
        try {
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
            console.log('💾 Saved favorites:', newFavorites.length, 'places');
        } catch (error) {
            console.error('❌ Error saving favorites:', error);
        }
    };

    const addToFavorites = async (place: ApprovedBusiness) => {
        try {
            const newFavorites = [...favorites, place];
            setFavorites(newFavorites);
            await saveFavorites(newFavorites);
            console.log('❤️ Added to favorites:', place.businessName);
        } catch (error) {
            console.error('❌ Error adding to favorites:', error);
        }
    };

    const removeFromFavorites = async (placeId: string) => {
        try {
            const newFavorites = favorites.filter(place => place.id !== placeId);
            setFavorites(newFavorites);
            await saveFavorites(newFavorites);
            console.log('💔 Removed from favorites:', placeId);
        } catch (error) {
            console.error('❌ Error removing from favorites:', error);
        }
    };

    const isFavorite = (placeId: string): boolean => {
        return favorites.some(place => place.id === placeId);
    };

    const toggleFavorite = async (place: ApprovedBusiness) => {
        if (isFavorite(place.id)) {
            await removeFromFavorites(place.id);
        } else {
            await addToFavorites(place);
        }
    };

    const value: FavoritesContextType = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        isLoading
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}; 