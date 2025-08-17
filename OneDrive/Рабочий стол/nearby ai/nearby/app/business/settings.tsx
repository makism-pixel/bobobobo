import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface BusinessSettings {
    acceptsReservations: boolean;
    hasDelivery: boolean;
    acceptsCards: boolean;
    notifications: {
        newReviews: boolean;
        newReservations: boolean;
        promotions: boolean;
    };
    visibility: {
        showOnMap: boolean;
        showRating: boolean;
        showReviews: boolean;
    };
    workingHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
}

const defaultSettings: BusinessSettings = {
    acceptsReservations: false,
    hasDelivery: false,
    acceptsCards: true,
    notifications: {
        newReviews: true,
        newReservations: true,
        promotions: false,
    },
    visibility: {
        showOnMap: true,
        showRating: true,
        showReviews: true,
    },
    workingHours: {
        monday: '9:00 - 18:00',
        tuesday: '9:00 - 18:00',
        wednesday: '9:00 - 18:00',
        thursday: '9:00 - 18:00',
        friday: '9:00 - 18:00',
        saturday: '10:00 - 16:00',
        sunday: 'Закрыто',
    }
};

export default function BusinessSettingsScreen() {
    const { user } = useAuth();
    const { businessId, businessName, isApproved } = useUserRole();
    const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, [businessId]);

    const loadSettings = async () => {
        if (!user || !businessId || !isApproved) {
            setLoading(false);
            return;
        }

        try {
            // Загружаем настройки из профиля бизнеса
            const q = query(
                collection(db, 'businessProfiles'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const profileData = snapshot.docs[0].data();

                // Объединяем настройки по умолчанию с сохраненными
                const loadedSettings = {
                    ...defaultSettings,
                    acceptsReservations: profileData.acceptsReservations || false,
                    hasDelivery: profileData.hasDelivery || false,
                    acceptsCards: profileData.acceptsCards || true,
                    workingHours: profileData.workingHours || defaultSettings.workingHours,
                    notifications: {
                        ...defaultSettings.notifications,
                        ...profileData.notifications,
                    },
                    visibility: {
                        ...defaultSettings.visibility,
                        ...profileData.visibility,
                    }
                };

                setSettings(loadedSettings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (path: string, value: any) => {
        if (!user || !businessId) return;

        try {
            setSaving(true);

            // Обновляем локальное состояние
            const keys = path.split('.');
            const newSettings = { ...settings };
            let current: any = newSettings;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            setSettings(newSettings);

            // Сохраняем в Firebase
            const q = query(
                collection(db, 'businessProfiles'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const docRef = snapshot.docs[0].ref;
                await updateDoc(docRef, {
                    [path]: value,
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить настройку');
        } finally {
            setSaving(false);
        }
    };

    if (!user || !isApproved) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Настройки</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>🚫</Text>
                    <Text style={styles.errorTitle}>Доступ ограничен</Text>
                    <Text style={styles.errorSubtitle}>
                        Настройки доступны только владельцам одобренных заведений
                    </Text>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Настройки</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Загружаем настройки...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Настройки</Text>
                {saving && (
                    <ActivityIndicator size="small" color="#8B1538" />
                )}
            </View>

            {/* Subtitle */}
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>{businessName}</Text>
                <Text style={styles.description}>
                    Управляйте настройками вашего заведения
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Основные настройки */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏪 Основные настройки</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>🪑 Принимаем бронирования</Text>
                                <Text style={styles.settingSubtitle}>
                                    Клиенты смогут забронировать столик
                                </Text>
                            </View>
                            <Switch
                                value={settings.acceptsReservations}
                                onValueChange={(value) => updateSetting('acceptsReservations', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>🚚 Доставка</Text>
                                <Text style={styles.settingSubtitle}>
                                    Предоставляем услуги доставки
                                </Text>
                            </View>
                            <Switch
                                value={settings.hasDelivery}
                                onValueChange={(value) => updateSetting('hasDelivery', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>💳 Оплата картой</Text>
                                <Text style={styles.settingSubtitle}>
                                    Принимаем банковские карты
                                </Text>
                            </View>
                            <Switch
                                value={settings.acceptsCards}
                                onValueChange={(value) => updateSetting('acceptsCards', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>
                    </View>
                </View>

                {/* Видимость */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👁️ Видимость</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>🗺️ Показывать на карте</Text>
                                <Text style={styles.settingSubtitle}>
                                    Ваше заведение будет видно на карте
                                </Text>
                            </View>
                            <Switch
                                value={settings.visibility.showOnMap}
                                onValueChange={(value) => updateSetting('visibility.showOnMap', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>⭐ Показывать рейтинг</Text>
                                <Text style={styles.settingSubtitle}>
                                    Отображать рейтинг заведения
                                </Text>
                            </View>
                            <Switch
                                value={settings.visibility.showRating}
                                onValueChange={(value) => updateSetting('visibility.showRating', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>💬 Показывать отзывы</Text>
                                <Text style={styles.settingSubtitle}>
                                    Отображать отзывы клиентов
                                </Text>
                            </View>
                            <Switch
                                value={settings.visibility.showReviews}
                                onValueChange={(value) => updateSetting('visibility.showReviews', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>
                    </View>
                </View>

                {/* Уведомления */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔔 Уведомления</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>⭐ Новые отзывы</Text>
                                <Text style={styles.settingSubtitle}>
                                    Уведомления о новых отзывах
                                </Text>
                            </View>
                            <Switch
                                value={settings.notifications.newReviews}
                                onValueChange={(value) => updateSetting('notifications.newReviews', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>🪑 Новые бронирования</Text>
                                <Text style={styles.settingSubtitle}>
                                    Уведомления о бронированиях
                                </Text>
                            </View>
                            <Switch
                                value={settings.notifications.newReservations}
                                onValueChange={(value) => updateSetting('notifications.newReservations', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>🚀 Промо-акции</Text>
                                <Text style={styles.settingSubtitle}>
                                    Рекламные предложения
                                </Text>
                            </View>
                            <Switch
                                value={settings.notifications.promotions}
                                onValueChange={(value) => updateSetting('notifications.promotions', value)}
                                trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>
                    </View>
                </View>

                {/* Дополнительные действия */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚙️ Дополнительно</Text>



                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => Alert.alert('Скоро', 'Функция экспорта данных будет добавлена')}
                    >
                        <Text style={styles.actionIcon}>📊</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Экспорт данных</Text>
                            <Text style={styles.actionSubtitle}>
                                Скачать отчеты и статистику
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={() => Alert.alert(
                            'Удаление аккаунта',
                            'Вы уверены? Это действие нельзя отменить.',
                            [
                                { text: 'Отмена', style: 'cancel' },
                                { text: 'Удалить', style: 'destructive' }
                            ]
                        )}
                    >
                        <Text style={styles.actionIcon}>🗑️</Text>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, styles.dangerText]}>
                                Удалить аккаунт
                            </Text>
                            <Text style={styles.actionSubtitle}>
                                Безвозвратно удалить ваше заведение
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    subtitleContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B1538',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#8E8E93',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    settingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    actionArrow: {
        fontSize: 18,
        color: '#C7C7CC',
        fontWeight: '600',
    },
    dangerButton: {
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    dangerText: {
        color: '#FF3B30',
    },
}); 