import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isFirstLaunch: boolean;
    setIsFirstLaunch: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(true);

    useEffect(() => {
        // Проверяем, первый ли это запуск
        const checkFirstLaunch = async () => {
            try {
                const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
                if (hasLaunchedBefore === null) {
                    setIsFirstLaunch(true);
                    await AsyncStorage.setItem('hasLaunchedBefore', 'true');
                } else {
                    setIsFirstLaunch(false);
                }
            } catch (error) {
                console.log('Error checking first launch:', error);
            }
        };

        checkFirstLaunch();

        // Слушаем изменения состояния авторизации
        const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth as Auth, email, password);
            // Даем Firebase время обновить состояние пользователя
            setTimeout(() => {
                setIsLoading(false);
            }, 100);
        } catch (error: any) {
            setIsLoading(false);
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);

            // Обновляем профиль пользователя с именем
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: name
                });
            }

            // Даем Firebase время обновить состояние пользователя
            setTimeout(() => {
                setIsLoading(false);
            }, 100);
        } catch (error: any) {
            setIsLoading(false);
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    const logout = async () => {
        try {
            await signOut(auth as Auth);
            // onAuthStateChanged обновит состояние
        } catch (error: any) {
            throw new Error('Ошибка выхода из аккаунта');
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth as Auth, email);
        } catch (error: any) {
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        isFirstLaunch,
        setIsFirstLaunch
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Функция для перевода ошибок Firebase на русский
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Пользователь с таким email уже существует';
        case 'auth/weak-password':
            return 'Пароль слишком слабый. Минимум 6 символов';
        case 'auth/invalid-email':
            return 'Неверный формат email';
        case 'auth/user-not-found':
            return 'Пользователь с таким email не найден';
        case 'auth/wrong-password':
            return 'Неверный пароль';
        case 'auth/too-many-requests':
            return 'Слишком много попыток. Попробуйте позже';
        case 'auth/network-request-failed':
            return 'Ошибка сети. Проверьте подключение к интернету';
        case 'auth/invalid-credential':
            return 'Неверные данные для входа';
        default:
            return 'Произошла ошибка. Попробуйте снова';
    }
}; 