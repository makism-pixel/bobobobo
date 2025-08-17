import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Типы для переводов
export interface Translations {
    // Общие
    loading: string;
    error: string;
    save: string;
    cancel: string;
    close: string;
    done: string;
    yes: string;
    no: string;

    // Навигация
    home: string;
    map: string;
    favorites: string;
    profile: string;
    admin: string;

    // Профиль
    profileTitle: string;
    loadingProfile: string;
    preferences: string;
    settings: string;
    favoriteCuisine: string;
    priceCategory: string;
    searchRadius: string;
    notifications: string;
    language: string;
    privacy: string;
    aboutApp: string;
    business: string;
    addEstablishment: string;
    login: string;
    logout: string;

    // Настройки уведомлений
    notificationsSettings: string;
    notificationsDescription: string;
    pushNotifications: string;
    pushNotificationsDesc: string;
    enabled: string;
    disabled: string;

    // Настройки приватности
    privacySettings: string;
    dataCollection: string;
    dataUsage: string;
    security: string;
    privacyPolicy: string;
    deleteAllData: string;

    // Ценовые категории
    economical: string;
    affordable: string;
    medium: string;
    expensive: string;
    premium: string;

    // Кухни
    european: string;
    asian: string;
    italian: string;
    japanese: string;
    mexican: string;
    indian: string;
    french: string;
    mediterranean: string;
    american: string;
    chinese: string;
    thai: string;
    korean: string;
    russian: string;
    caucasian: string;
    uzbek: string;
}

// Переводы на русский
const ruTranslations: Translations = {
    // Общие
    loading: 'Загрузка...',
    error: 'Ошибка',
    save: 'Сохранить',
    cancel: 'Отмена',
    close: 'Закрыть',
    done: 'Готово',
    yes: 'Да',
    no: 'Нет',

    // Навигация
    home: 'Главная',
    map: 'Карта',
    favorites: 'Избранное',
    profile: 'Профиль',
    admin: 'Админ',

    // Профиль
    profileTitle: 'Профиль',
    loadingProfile: 'Загружаем профиль...',
    preferences: 'Предпочтения',
    settings: 'Настройки',
    favoriteCuisine: 'Любимая кухня',
    priceCategory: 'Ценовая категория',
    searchRadius: 'Радиус поиска',
    notifications: 'Уведомления',
    language: 'Язык',
    privacy: 'Приватность',
    aboutApp: 'О приложении',
    business: 'Для бизнеса',
    addEstablishment: 'Добавить заведение',
    login: 'Войти в аккаунт',
    logout: 'Выйти из аккаунта',

    // Настройки уведомлений
    notificationsSettings: 'Уведомления',
    notificationsDescription: 'Настройте уведомления о новых местах, акциях и событиях',
    pushNotifications: 'Push-уведомления',
    pushNotificationsDesc: 'Получать уведомления о новых местах, акциях и мероприятиях',
    enabled: 'Включены',
    disabled: 'Отключены',

    // Настройки приватности
    privacySettings: 'Настройки конфиденциальности',
    dataCollection: 'Сбор данных',
    dataUsage: 'Использование данных',
    security: 'Безопасность',
    privacyPolicy: 'Полная политика конфиденциальности',
    deleteAllData: 'Удалить все мои данные',

    // Ценовые категории
    economical: 'Экономно',
    affordable: 'Доступно',
    medium: 'Средне',
    expensive: 'Дорого',
    premium: 'Премиум',

    // Кухни
    european: 'Европейская',
    asian: 'Азиатская',
    italian: 'Итальянская',
    japanese: 'Японская',
    mexican: 'Мексиканская',
    indian: 'Индийская',
    french: 'Французская',
    mediterranean: 'Средиземноморская',
    american: 'Американская',
    chinese: 'Китайская',
    thai: 'Тайская',
    korean: 'Корейская',
    russian: 'Русская',
    caucasian: 'Кавказская',
    uzbek: 'Узбекская',
};

// Переводы на английский
const enTranslations: Translations = {
    // Общие
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    done: 'Done',
    yes: 'Yes',
    no: 'No',

    // Навигация
    home: 'Home',
    map: 'Map',
    favorites: 'Favorites',
    profile: 'Profile',
    admin: 'Admin',

    // Профиль
    profileTitle: 'Profile',
    loadingProfile: 'Loading profile...',
    preferences: 'Preferences',
    settings: 'Settings',
    favoriteCuisine: 'Favorite Cuisine',
    priceCategory: 'Price Category',
    searchRadius: 'Search Radius',
    notifications: 'Notifications',
    language: 'Language',
    privacy: 'Privacy',
    aboutApp: 'About App',
    business: 'For Business',
    addEstablishment: 'Add Establishment',
    login: 'Sign In',
    logout: 'Sign Out',

    // Настройки уведомлений
    notificationsSettings: 'Notifications',
    notificationsDescription: 'Configure notifications about new places, promotions and events',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive notifications about new places, promotions and events',
    enabled: 'Enabled',
    disabled: 'Disabled',

    // Настройки приватности
    privacySettings: 'Privacy Settings',
    dataCollection: 'Data Collection',
    dataUsage: 'Data Usage',
    security: 'Security',
    privacyPolicy: 'Full Privacy Policy',
    deleteAllData: 'Delete All My Data',

    // Ценовые категории
    economical: 'Budget',
    affordable: 'Affordable',
    medium: 'Medium',
    expensive: 'Expensive',
    premium: 'Premium',

    // Кухни
    european: 'European',
    asian: 'Asian',
    italian: 'Italian',
    japanese: 'Japanese',
    mexican: 'Mexican',
    indian: 'Indian',
    french: 'French',
    mediterranean: 'Mediterranean',
    american: 'American',
    chinese: 'Chinese',
    thai: 'Thai',
    korean: 'Korean',
    russian: 'Russian',
    caucasian: 'Caucasian',
    uzbek: 'Uzbek',
};

// Все доступные переводы
const translations = {
    'Русский': ruTranslations,
    'English': enTranslations,
    'Español': ruTranslations, // Пока используем русский как fallback
    'Français': ruTranslations,
    'Deutsch': ruTranslations,
    'Italiano': ruTranslations,
    'Português': ruTranslations,
};

interface LanguageContextType {
    currentLanguage: string;
    setLanguage: (language: string) => void;
    t: Translations;
    isLoading: boolean;
    version: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState<string>('Русский');
    const [isLoading, setIsLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const { user } = useAuth();

    // Синхронизация с настройками пользователя из Firebase
    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false);
            return;
        }

        const userPrefsRef = doc(db, 'userPreferences', user.uid);

        // Подписываемся на изменения настроек пользователя
        const unsubscribe = onSnapshot(userPrefsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.language) {
                    console.log('🌍 Language updated from Firebase:', data.language);
                    setCurrentLanguage(data.language);
                    setVersion(prev => prev + 1); // Принудительное обновление
                }
            } else {
                // Если документа нет, используем русский по умолчанию
                setCurrentLanguage('Русский');
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Error listening to language changes:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Функция для обновления языка (вызывается из профиля)
    const setLanguage = (language: string) => {
        console.log('🔄 Setting language to:', language);
        setCurrentLanguage(language);
        setVersion(prev => prev + 1); // Принудительное обновление
    };

    // Мемоизируем переводы для реактивного обновления
    const t = useMemo(() => {
        const selectedTranslations = translations[currentLanguage as keyof typeof translations] || ruTranslations;
        console.log('🔄 Translations updated for language:', currentLanguage);
        return selectedTranslations;
    }, [currentLanguage]);

    const value: LanguageContextType = useMemo(() => ({
        currentLanguage,
        setLanguage,
        t,
        isLoading,
        version
    }), [currentLanguage, t, isLoading, version]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}; 