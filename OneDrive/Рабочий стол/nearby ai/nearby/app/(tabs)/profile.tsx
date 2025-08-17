import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserPreferences {
    favoriteCuisines: string[];
    priceRange: { min: number; max: number };
    searchRadius: number;
    notifications: boolean;
    language: string;
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { t, currentLanguage, setLanguage, version } = useLanguage();
    const {
        isBusiness,
        isApproved,
        isPending,
        isRejected,
        businessName,
        businessStatus,
        loading: roleLoading
    } = useUserRole();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>({
        favoriteCuisines: [],
        priceRange: { min: 1, max: 3 },
        searchRadius: 1,
        notifications: true,
        language: 'Русский'
    });

    // Отладочная информация
    useEffect(() => {
        console.log('🔍 Profile: Current language from context:', currentLanguage);
        console.log('🔍 Profile: User preferences language:', preferences.language);
        console.log('🔍 Profile: Context version:', version);
        console.log('🔍 Profile: Sample translation (profileTitle):', t.profileTitle);
    }, [currentLanguage, preferences.language, version, t.profileTitle]);
    const [loading, setLoading] = useState(true);

    // Модальные окна
    const [showCuisineModal, setShowCuisineModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showRadiusModal, setShowRadiusModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Функция для получения переведенных названий кухонь
    const getCuisineTranslations = () => {
        return {
            'Европейская': t.european,
            'Азиатская': t.asian,
            'Итальянская': t.italian,
            'Японская': t.japanese,
            'Мексиканская': t.mexican,
            'Индийская': t.indian,
            'Французская': t.french,
            'Средиземноморская': t.mediterranean,
            'Американская': t.american,
            'Китайская': t.chinese,
            'Тайская': t.thai,
            'Корейская': t.korean,
            'Русская': t.russian,
            'Кавказская': t.caucasian,
            'Узбекская': t.uzbek,
        };
    };

    // Функция для получения переведенных ценовых категорий
    const getPriceTranslations = () => {
        return [
            { min: 1, max: 1, label: `€ - ${t.economical}`, desc: 'До 10€ на человека' },
            { min: 1, max: 2, label: `€ - €€ - ${t.affordable}`, desc: '10-25€ на человека' },
            { min: 2, max: 3, label: `€€ - €€€ - ${t.medium}`, desc: '25-50€ на человека' },
            { min: 3, max: 4, label: `€€€ - €€€€ - ${t.expensive}`, desc: '50-100€ на человека' },
            { min: 4, max: 4, label: `€€€€ - ${t.premium}`, desc: 'Свыше 100€ на человека' }
        ];
    };

    // Загрузка предпочтений пользователя
    useEffect(() => {
        const loadPreferences = async () => {
            // Если пользователь не авторизован, сразу заканчиваем загрузку
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            // Ждем завершения загрузки роли
            if (roleLoading) {
                return;
            }

            // Небольшая задержка для установки токена
            setTimeout(() => {
                loadUserPreferences();
            }, 300);
        };

        loadPreferences();
    }, [user?.uid, roleLoading]);

    const loadUserPreferences = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        let retryCount = 0;
        const maxRetries = 2;

        const attemptLoad = async (): Promise<void> => {
            try {
                // Проверяем токен только если пользователь авторизован
                if (user) {
                    await user.getIdToken(true);
                }

                const userDocRef = doc(db, 'userPreferences', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserPreferences;
                    setPreferences(data);
                    console.log('✅ Loaded user preferences:', data);
                } else {
                    // Создаем документ с дефолтными настройками
                    const defaultPrefs: UserPreferences = {
                        favoriteCuisines: [],
                        priceRange: { min: 1, max: 3 },
                        searchRadius: 1,
                        notifications: true,
                        language: currentLanguage || 'Русский' // Используем текущий язык из контекста
                    };
                    await setDoc(userDocRef, defaultPrefs);
                    setPreferences(defaultPrefs);
                    console.log('✅ Created default user preferences with language:', defaultPrefs.language);
                }

                setLoading(false);
            } catch (error: any) {
                console.error('❌ Error loading user preferences:', error);

                // Если это ошибка доступа и у нас есть попытки
                if ((error.code === 'permission-denied' || error.message?.includes('permissions')) && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`🔄 Retrying user preferences load (attempt ${retryCount}/${maxRetries})...`);
                    setTimeout(() => {
                        attemptLoad();
                    }, 1000);
                } else {
                    // Максимум попыток достигнут или другая ошибка
                    console.log('❌ Failed to load user preferences after retries');
                    setLoading(false);
                }
            }
        };

        await attemptLoad();
    };

    const saveUserPreferences = async (newPreferences: UserPreferences) => {
        if (!user?.uid) return;

        try {
            // Проверяем токен аутентификации перед сохранением
            await user.getIdToken(true);

            const userDocRef = doc(db, 'userPreferences', user.uid);
            await setDoc(userDocRef, newPreferences, { merge: true });
            setPreferences(newPreferences);

            console.log('✅ Saved user preferences:', newPreferences);
            console.log('🌍 Language saved to Firebase:', newPreferences.language);

            // LanguageContext автоматически подхватит изменения через onSnapshot
        } catch (error: any) {
            console.error('❌ Error saving user preferences:', error);

            if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
                Alert.alert(
                    t.error,
                    'Не удалось сохранить настройки. Попробуйте перезайти в приложение.'
                );
            } else {
                Alert.alert(t.error, 'Не удалось сохранить настройки');
            }
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Выйти из аккаунта?',
            'Вы уверены, что хотите выйти?',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Выйти',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await logout();
                            setIsLoggingOut(false); // Сбрасываем состояние после успешного выхода
                            // AuthContext автоматически перенаправит на экран входа
                        } catch (error: any) {
                            console.error('Logout error:', error);
                            Alert.alert(
                                'Ошибка выхода',
                                'Не удалось выйти из аккаунта. Попробуйте еще раз.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => setIsLoggingOut(false)
                                    }
                                ]
                            );
                        }
                    },
                },
            ]
        );
    };

    // Если пользователь не авторизован, перенаправляем на страницу регистрации
    if (!user) {
        router.replace('/auth/welcome');
        return null;
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t.profileTitle}</Text>
                </View>
                <View style={[styles.loadingContainer, { flex: 1, paddingTop: 100 }]}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={{ marginTop: 16, color: '#8E8E93' }}>{t.loadingProfile}</Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t.profileTitle}</Text>
            </View>

            {/* User Section */}
            <View style={styles.userSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {user?.displayName || 'Пользователь'}
                    </Text>
                    <Text style={styles.userEmail}>
                        {user?.email || 'email@example.com'}
                    </Text>
                </View>
            </View>

            {/* Preferences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.preferences}</Text>

                <TouchableOpacity
                    style={styles.preferenceItem}
                    onPress={() => setShowCuisineModal(true)}
                >
                    <View style={styles.preferenceIcon}>
                        <Text style={styles.preferenceEmoji}>🍽️</Text>
                    </View>
                    <View style={styles.preferenceContent}>
                        <Text style={styles.preferenceTitle}>{t.favoriteCuisine}</Text>
                        <Text style={styles.preferenceSubtitle}>
                            {preferences.favoriteCuisines.length > 0
                                ? preferences.favoriteCuisines.map(cuisine => getCuisineTranslations()[cuisine as keyof ReturnType<typeof getCuisineTranslations>] || cuisine).join(', ')
                                : 'Не выбрано'
                            }
                        </Text>
                    </View>
                    <Text style={styles.preferenceArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.preferenceItem}
                    onPress={() => setShowPriceModal(true)}
                >
                    <View style={styles.preferenceIcon}>
                        <Text style={styles.preferenceEmoji}>💰</Text>
                    </View>
                    <View style={styles.preferenceContent}>
                        <Text style={styles.preferenceTitle}>{t.priceCategory}</Text>
                        <Text style={styles.preferenceSubtitle}>
                            {'€'.repeat(preferences.priceRange.min)} - {'€'.repeat(preferences.priceRange.max)}
                        </Text>
                    </View>
                    <Text style={styles.preferenceArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.preferenceItem}
                    onPress={() => setShowRadiusModal(true)}
                >
                    <View style={styles.preferenceIcon}>
                        <Text style={styles.preferenceEmoji}>📍</Text>
                    </View>
                    <View style={styles.preferenceContent}>
                        <Text style={styles.preferenceTitle}>{t.searchRadius}</Text>
                        <Text style={styles.preferenceSubtitle}>{preferences.searchRadius} км</Text>
                    </View>
                    <Text style={styles.preferenceArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.settings}</Text>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => setShowNotificationsModal(true)}
                >
                    <View style={styles.settingIcon}>
                        <Text style={styles.settingEmoji}>🔔</Text>
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{t.notifications}</Text>
                        <Text style={styles.settingSubtitle}>
                            {preferences.notifications ? t.enabled : t.disabled}
                        </Text>
                    </View>
                    <View style={[
                        styles.settingBadge,
                        !preferences.notifications && styles.settingBadgeOff
                    ]}>
                        <Text style={styles.settingBadgeText}>
                            {preferences.notifications ? 'Вкл' : 'Выкл'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => setShowLanguageModal(true)}
                >
                    <View style={styles.settingIcon}>
                        <Text style={styles.settingEmoji}>🌍</Text>
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{t.language}</Text>
                        <Text style={styles.settingSubtitle}>{preferences.language}</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => setShowPrivacyModal(true)}
                >
                    <View style={styles.settingIcon}>
                        <Text style={styles.settingEmoji}>🔒</Text>
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{t.privacy}</Text>
                        <Text style={styles.settingSubtitle}>Настройки данных</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Business Section */}
            {isBusiness ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {isApproved ? 'О бизнесе' : 'Мой бизнес'}
                    </Text>

                    {/* Статус заявки */}
                    {isPending && (
                        <View style={[styles.businessCard, styles.pendingCard]}>
                            <View style={[styles.businessIcon, styles.pendingIcon]}>
                                <Text style={styles.businessEmoji}>⏳</Text>
                            </View>
                            <View style={styles.businessContent}>
                                <Text style={styles.businessTitle}>Заявка на рассмотрении</Text>
                                <Text style={styles.businessSubtitle}>
                                    Ваша заявка "{businessName}" проверяется администратором
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Отклоненная заявка */}
                    {isRejected && (
                        <View style={[styles.businessCard, styles.rejectedCard]}>
                            <View style={[styles.businessIcon, styles.rejectedIcon]}>
                                <Text style={styles.businessEmoji}>❌</Text>
                            </View>
                            <View style={styles.businessContent}>
                                <Text style={styles.businessTitle}>Заявка отклонена</Text>
                                <Text style={styles.businessSubtitle}>
                                    К сожалению, заявка "{businessName}" была отклонена
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Одобренный бизнес - расширенный кабинет */}
                    {isApproved && (
                        <>
                            {/* Главная карточка бизнеса */}
                            <View style={[styles.businessCard, styles.approvedCard]}>
                                <View style={[styles.businessIcon, styles.approvedIcon]}>
                                    <Text style={styles.businessEmoji}>✅</Text>
                                </View>
                                <View style={styles.businessContent}>
                                    <Text style={styles.businessTitle}>{businessName}</Text>
                                    <Text style={styles.businessSubtitle}>
                                        Заведение одобрено и активно
                                    </Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>АКТИВНО</Text>
                                </View>
                            </View>



                            {/* Управление бизнесом */}
                            <View style={styles.businessGrid}>
                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/dashboard')}
                                >
                                    <Text style={styles.gridIcon}>📊</Text>
                                    <Text style={styles.gridTitle}>Дашборд</Text>
                                    <Text style={styles.gridSubtitle}>Статистика и аналитика</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/events')}
                                >
                                    <Text style={styles.gridIcon}>🎉</Text>
                                    <Text style={styles.gridTitle}>События</Text>
                                    <Text style={styles.gridSubtitle}>Акции и мероприятия</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/menu')}
                                >
                                    <Text style={styles.gridIcon}>📋</Text>
                                    <Text style={styles.gridTitle}>Меню</Text>
                                    <Text style={styles.gridSubtitle}>Услуги и товары</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/photos')}
                                >
                                    <Text style={styles.gridIcon}>📸</Text>
                                    <Text style={styles.gridTitle}>Фото</Text>
                                    <Text style={styles.gridSubtitle}>Галерея заведения</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/layout')}
                                >
                                    <Text style={styles.gridIcon}>📐</Text>
                                    <Text style={styles.gridTitle}>Планировка</Text>
                                    <Text style={styles.gridSubtitle}>Схема террасы</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/reviews')}
                                >
                                    <Text style={styles.gridIcon}>⭐</Text>
                                    <Text style={styles.gridTitle}>Отзывы</Text>
                                    <Text style={styles.gridSubtitle}>Управление отзывами</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/settings')}
                                >
                                    <Text style={styles.gridIcon}>⚙️</Text>
                                    <Text style={styles.gridTitle}>Настройки</Text>
                                    <Text style={styles.gridSubtitle}>Часы работы, контакты</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/pricing')}
                                >
                                    <Text style={styles.gridIcon}>💎</Text>
                                    <Text style={styles.gridTitle}>Тарифы</Text>
                                    <Text style={styles.gridSubtitle}>Планы и подписки</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/booking')}
                                >
                                    <Text style={styles.gridIcon}>🍽️</Text>
                                    <Text style={styles.gridTitle}>Бронирование</Text>
                                    <Text style={styles.gridSubtitle}>Настройка столиков</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.businessGridItem}
                                    onPress={() => router.push('/business/delivery')}
                                >
                                    <Text style={styles.gridIcon}>🚚</Text>
                                    <Text style={styles.gridTitle}>Доставка</Text>
                                    <Text style={styles.gridSubtitle}>Настройка доставки</Text>
                                </TouchableOpacity>


                            </View>
                        </>
                    )}
                </View>
            ) : (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Для бизнеса</Text>

                    <TouchableOpacity
                        style={styles.businessCard}
                        onPress={() => {
                            // Проверяем авторизацию перед переходом к регистрации бизнеса
                            if (!user) {
                                Alert.alert(
                                    'Требуется авторизация',
                                    'Для добавления заведения необходимо войти в аккаунт или зарегистрироваться',
                                    [
                                        {
                                            text: 'Отмена',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Регистрация',
                                            onPress: () => router.push('/auth/register')
                                        },
                                        {
                                            text: 'Войти',
                                            onPress: () => router.push('/auth/login')
                                        }
                                    ]
                                );
                            } else {
                                router.push('/business/welcome');
                            }
                        }}
                    >
                        <View style={styles.businessIcon}>
                            <Text style={styles.businessEmoji}>🏪</Text>
                        </View>
                        <View style={styles.businessContent}>
                            <Text style={styles.businessTitle}>Добавить заведение</Text>
                            <Text style={styles.businessSubtitle}>
                                Зарегистрируйте свой бизнес и привлекайте новых клиентов
                            </Text>
                        </View>
                        <Text style={styles.businessArrow}>→</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>О приложении</Text>

                <TouchableOpacity style={styles.aboutSection}>
                    <View style={styles.aboutIcon}>
                        <Text style={styles.aboutEmoji}>ℹ️</Text>
                    </View>
                    <View style={styles.aboutContent}>
                        <Text style={styles.aboutTitle}>Nearby AI</Text>
                        <Text style={styles.aboutSubtitle}>Версия 1.0.0</Text>
                        <Text style={styles.aboutDescription}>
                            Умный помощник для поиска лучших мест рядом с вами
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Account Actions */}
            <View style={styles.section}>
                <View style={styles.accountActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.loginButton]}
                        onPress={() => {
                            // Прямой переход к экрану логина
                            router.push('/auth/login');
                        }}
                        disabled={isLoggingOut}
                    >
                        <Text style={styles.loginButtonText}>🔑Войти в аккаунт</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#FF3B30" />
                                <Text style={[styles.logoutButtonText, { marginLeft: 8 }]}>Выход...</Text>
                            </View>
                        ) : (
                            <Text style={styles.logoutButtonText}>🚪 Выйти из аккаунта</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Модальные окна для редактирования предпочтений */}

            {/* Модальное окно выбора кухни */}
            <Modal
                visible={showCuisineModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowCuisineModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.favoriteCuisine}</Text>
                        <TouchableOpacity onPress={() => {
                            saveUserPreferences(preferences);
                            setShowCuisineModal(false);
                        }}>
                            <Text style={styles.modalSaveButton}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {['Европейская', 'Азиатская', 'Итальянская', 'Японская', 'Мексиканская', 'Индийская', 'Французская', 'Средиземноморская', 'Американская', 'Китайская', 'Тайская', 'Корейская', 'Русская', 'Кавказская', 'Узбекская'].map((cuisine) => {
                            const cuisineTranslations = getCuisineTranslations();
                            const translatedName = cuisineTranslations[cuisine as keyof typeof cuisineTranslations] || cuisine;

                            return (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[
                                        styles.cuisineOption,
                                        preferences.favoriteCuisines.includes(cuisine) && styles.cuisineOptionSelected
                                    ]}
                                    onPress={() => {
                                        const newCuisines = preferences.favoriteCuisines.includes(cuisine)
                                            ? preferences.favoriteCuisines.filter(c => c !== cuisine)
                                            : [...preferences.favoriteCuisines, cuisine];
                                        setPreferences(prev => ({
                                            ...prev,
                                            favoriteCuisines: newCuisines
                                        }));
                                    }}
                                >
                                    <Text style={[
                                        styles.cuisineOptionText,
                                        preferences.favoriteCuisines.includes(cuisine) && styles.cuisineOptionTextSelected
                                    ]}>
                                        {translatedName}
                                    </Text>
                                    {preferences.favoriteCuisines.includes(cuisine) && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Modal>

            {/* Модальное окно ценовой категории */}
            <Modal
                visible={showPriceModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowPriceModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.priceCategory}</Text>
                        <TouchableOpacity onPress={() => {
                            saveUserPreferences(preferences);
                            setShowPriceModal(false);
                        }}>
                            <Text style={styles.modalSaveButton}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.priceDescription}>Выберите диапазон цен для поиска заведений</Text>

                        {getPriceTranslations().map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.priceOption,
                                    preferences.priceRange.min === option.min && preferences.priceRange.max === option.max && styles.priceOptionSelected
                                ]}
                                onPress={() => {
                                    setPreferences(prev => ({
                                        ...prev,
                                        priceRange: { min: option.min, max: option.max }
                                    }));
                                }}
                            >
                                <View>
                                    <Text style={[
                                        styles.priceOptionLabel,
                                        preferences.priceRange.min === option.min && preferences.priceRange.max === option.max && styles.priceOptionLabelSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={styles.priceOptionDesc}>{option.desc}</Text>
                                </View>
                                {preferences.priceRange.min === option.min && preferences.priceRange.max === option.max && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Модальное окно радиуса поиска */}
            <Modal
                visible={showRadiusModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowRadiusModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.searchRadius}</Text>
                        <TouchableOpacity onPress={() => {
                            saveUserPreferences(preferences);
                            setShowRadiusModal(false);
                        }}>
                            <Text style={styles.modalSaveButton}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.radiusDescription}>На каком расстоянии искать заведения?</Text>

                        {[0.5, 1, 2, 5, 10, 25].map((radius) => (
                            <TouchableOpacity
                                key={radius}
                                style={[
                                    styles.radiusOption,
                                    preferences.searchRadius === radius && styles.radiusOptionSelected
                                ]}
                                onPress={() => {
                                    setPreferences(prev => ({
                                        ...prev,
                                        searchRadius: radius
                                    }));
                                }}
                            >
                                <Text style={[
                                    styles.radiusOptionText,
                                    preferences.searchRadius === radius && styles.radiusOptionTextSelected
                                ]}>
                                    {radius} км
                                </Text>
                                {preferences.searchRadius === radius && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Модальное окно уведомлений */}
            <Modal
                visible={showNotificationsModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.notificationsSettings}</Text>
                        <TouchableOpacity onPress={() => {
                            saveUserPreferences(preferences);
                            setShowNotificationsModal(false);
                        }}>
                            <Text style={styles.modalSaveButton}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.notificationDescription}>
                            {t.notificationsDescription}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.notificationOption,
                                preferences.notifications && styles.notificationOptionSelected
                            ]}
                            onPress={() => {
                                setPreferences(prev => ({
                                    ...prev,
                                    notifications: !prev.notifications
                                }));
                            }}
                        >
                            <View>
                                <Text style={[
                                    styles.notificationOptionLabel,
                                    preferences.notifications && styles.notificationOptionLabelSelected
                                ]}>
                                    {t.pushNotifications}
                                </Text>
                                <Text style={styles.notificationOptionDesc}>
                                    {t.pushNotificationsDesc}
                                </Text>
                            </View>
                            {preferences.notifications && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Модальное окно языка */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.language}</Text>
                        <TouchableOpacity onPress={() => {
                            saveUserPreferences(preferences);
                            setShowLanguageModal(false);
                        }}>
                            <Text style={styles.modalSaveButton}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {['Русский', 'English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português'].map((language) => (
                            <TouchableOpacity
                                key={language}
                                style={[
                                    styles.languageOption,
                                    preferences.language === language && styles.languageOptionSelected
                                ]}
                                onPress={() => {
                                    setPreferences(prev => ({
                                        ...prev,
                                        language: language
                                    }));
                                }}
                            >
                                <Text style={[
                                    styles.languageOptionText,
                                    preferences.language === language && styles.languageOptionTextSelected
                                ]}>
                                    {language}
                                </Text>
                                {preferences.language === language && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* Модальное окно приватности */}
            <Modal
                visible={showPrivacyModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                            <Text style={styles.modalCancelButton}>{t.close}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t.privacy}</Text>
                        <View style={{ width: 60 }}></View>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.privacyTitle}>{t.privacySettings}</Text>

                        <View style={styles.privacySection}>
                            <Text style={styles.privacySectionTitle}>{t.dataCollection}</Text>
                            <Text style={styles.privacyText}>
                                Мы собираем только необходимые данные для работы приложения:
                                ваши предпочтения, избранные места и отзывы.
                            </Text>
                        </View>

                        <View style={styles.privacySection}>
                            <Text style={styles.privacySectionTitle}>{t.dataUsage}</Text>
                            <Text style={styles.privacyText}>
                                Ваши данные используются для персонализации рекомендаций
                                и улучшения качества сервиса.
                            </Text>
                        </View>

                        <View style={styles.privacySection}>
                            <Text style={styles.privacySectionTitle}>{t.security}</Text>
                            <Text style={styles.privacyText}>
                                Все данные защищены современными методами шифрования
                                и хранятся в защищенных облачных сервисах.
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.privacyButton}>
                            <Text style={styles.privacyButtonText}>
                                📄 {t.privacyPolicy}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.privacyButton, styles.privacyButtonDanger]}>
                            <Text style={[styles.privacyButtonText, styles.privacyButtonTextDanger]}>
                                🗑️ {t.deleteAllData}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },

    // Header
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#8B1538',
    },

    // User Section
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    avatar: {
        width: 60,
        height: 60,
        backgroundColor: '#8B1538',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
    },

    // Section
    section: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },

    // Preferences
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    preferenceIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#F2F2F7',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    preferenceEmoji: {
        fontSize: 18,
    },
    preferenceContent: {
        flex: 1,
    },
    preferenceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 2,
    },
    preferenceSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    preferenceArrow: {
        fontSize: 20,
        color: '#8E8E93',
    },

    // Settings
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#F2F2F7',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingEmoji: {
        fontSize: 18,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    settingBadge: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    settingBadgeOff: {
        backgroundColor: '#8E8E93',
    },
    settingBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    settingArrow: {
        fontSize: 20,
        color: '#8E8E93',
    },

    // Business
    businessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    businessIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#8B1538',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    businessEmoji: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    businessContent: {
        flex: 1,
    },
    businessTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    businessSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    businessArrow: {
        fontSize: 20,
        color: '#8B1538',
        fontWeight: '600',
        marginLeft: 12,
    },
    businessActiveCard: {
        borderColor: '#8B1538',
        borderWidth: 2,
    },
    businessActiveIcon: {
        backgroundColor: '#34C759',
    },

    // Статусы бизнеса
    pendingCard: {
        borderColor: '#FF9500',
        borderWidth: 2,
    },
    pendingIcon: {
        backgroundColor: '#FF9500',
    },
    rejectedCard: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    rejectedIcon: {
        backgroundColor: '#FF3B30',
    },
    approvedCard: {
        borderColor: '#34C759',
        borderWidth: 2,
    },
    approvedIcon: {
        backgroundColor: '#34C759',
    },
    statusBadge: {
        backgroundColor: '#34C759',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Сетка управления бизнесом
    businessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    businessGridItem: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gridIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    gridTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
        textAlign: 'center',
    },
    gridSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 16,
    },

    // About
    aboutSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
    },
    aboutIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#8B1538',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    aboutEmoji: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    aboutContent: {
        flex: 1,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    aboutSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
    },
    aboutDescription: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },

    // Account Actions
    accountActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },

    // Login Button
    loginButton: {
        backgroundColor: '#8B1538',
        borderWidth: 2,
        borderColor: '#8B1538',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Logout Button
    logoutButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#FF3B30',
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '700',
    },

    // Loading State
    loadingContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    modalCancelButton: {
        fontSize: 16,
        color: '#8E8E93',
    },
    modalSaveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B1538',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },

    // Cuisine Modal
    cuisineOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    cuisineOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F7',
    },
    cuisineOptionText: {
        fontSize: 16,
        color: '#1D1D1F',
    },
    cuisineOptionTextSelected: {
        color: '#8B1538',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '700',
    },

    // Price Modal
    priceDescription: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 20,
        textAlign: 'center',
    },
    priceOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    priceOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F7',
    },
    priceOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    priceOptionLabelSelected: {
        color: '#8B1538',
    },
    priceOptionDesc: {
        fontSize: 14,
        color: '#8E8E93',
    },

    // Radius Modal
    radiusDescription: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 20,
        textAlign: 'center',
    },
    radiusOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    radiusOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F7',
    },
    radiusOptionText: {
        fontSize: 16,
        color: '#1D1D1F',
    },
    radiusOptionTextSelected: {
        color: '#8B1538',
        fontWeight: '600',
    },

    // Notification Modal
    notificationDescription: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 20,
        textAlign: 'center',
    },
    notificationOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    notificationOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F7',
    },
    notificationOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    notificationOptionLabelSelected: {
        color: '#8B1538',
    },
    notificationOptionDesc: {
        fontSize: 14,
        color: '#8E8E93',
    },

    // Language Modal
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    languageOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F7',
    },
    languageOptionText: {
        fontSize: 16,
        color: '#1D1D1F',
    },
    languageOptionTextSelected: {
        color: '#8B1538',
        fontWeight: '600',
    },

    // Privacy Modal
    privacyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 20,
        textAlign: 'center',
    },
    privacySection: {
        marginBottom: 20,
    },
    privacySectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    privacyText: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },
    privacyButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    privacyButtonDanger: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    privacyButtonText: {
        fontSize: 16,
        color: '#1D1D1F',
        textAlign: 'center',
    },
    privacyButtonTextDanger: {
        color: '#FF3B30',
        fontWeight: '600',
    },


}); 