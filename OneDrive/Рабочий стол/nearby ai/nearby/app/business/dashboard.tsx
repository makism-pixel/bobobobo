import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Switch,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';


const { width } = Dimensions.get('window');

interface BusinessProfile {
    businessName: string;
    businessType: string;
    description: string;
    phone: string;
    address: string;
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    acceptsReservations: boolean;
    hasDelivery: boolean;
    acceptsCards: boolean;
    createdAt: any;
    currentTariff?: string;
    tariffExpiryDate?: any;
}

interface BusinessStats {
    views: number;
    clicks: number;
    favorites: number;
    rating: number;
    reviewsCount: number;
}

export default function BusinessDashboardScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [stats, setStats] = useState<BusinessStats>({
        views: 0,
        clicks: 0,
        favorites: 0,
        rating: 0,
        reviewsCount: 0
    });

    useEffect(() => {
        loadBusinessProfile();
    }, []);

    const loadBusinessProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const q = query(
                collection(db, 'businessProfiles'),
                where('userId', '==', user.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot: any) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setProfile(doc.data() as BusinessProfile);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading business profile:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBusinessProfile();
        setRefreshing(false);
    };

    const updateBusinessSetting = async (field: string, value: any) => {
        if (!user || !profile) return;

        try {
            const q = query(
                collection(db, 'businessProfiles'),
                where('userId', '==', user.uid)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    [field]: value,
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating business setting:', error);
            Alert.alert('Ошибка', 'Не удалось обновить настройку');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#34C759';
            case 'pending': return '#FF9500';
            case 'rejected': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Одобрено';
            case 'pending': return 'На рассмотрении';
            case 'rejected': return 'Отклонено';
            default: return 'Неизвестно';
        }
    };

    const getTariffInfo = (tariff?: string) => {
        switch (tariff) {
            case 'premium': return {
                name: 'Премиум',
                color: 'linear-gradient(135deg, #FFD700, #FFA500)',
                solidColor: '#FFD700',
                emoji: '👑'
            };
            case 'standard': return {
                name: 'Стандарт',
                color: 'linear-gradient(135deg, #34C759, #28A745)',
                solidColor: '#34C759',
                emoji: '⭐'
            };
            case 'basic': return {
                name: 'Базовый',
                color: 'linear-gradient(135deg, #007AFF, #0056CC)',
                solidColor: '#007AFF',
                emoji: '📦'
            };
            default: return {
                name: 'Бесплатный',
                color: 'linear-gradient(135deg, #8E8E93, #6D6D70)',
                solidColor: '#8E8E93',
                emoji: '🆓'
            };
        }
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysUntilExpiry = (date: any) => {
        if (!date) return 0;
        const expiryDate = date.toDate ? date.toDate() : new Date(date);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B1538" />
                <Text style={styles.loadingText}>Загрузка дашборда...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyTitle}>Профиль не найден</Text>
                <Text style={styles.emptySubtitle}>Создайте профиль заведения</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/business/register')}
                >
                    <Text style={styles.createButtonText}>Создать профиль</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.businessInfo}>
                        <Text style={styles.businessName}>{profile.businessName}</Text>
                        <View style={styles.tariffContainer}>
                            <View style={[
                                styles.tariffBadge,
                                { backgroundColor: getTariffInfo(profile.currentTariff).solidColor }
                            ]}>
                                <Text style={styles.tariffEmoji}>{getTariffInfo(profile.currentTariff).emoji}</Text>
                                <Text style={styles.tariffText}>{getTariffInfo(profile.currentTariff).name}</Text>
                                <View style={styles.tariffShine} />
                            </View>
                        </View>
                        <Text style={styles.businessType}>{profile.businessType}</Text>
                        <View style={styles.statusBadge}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor(profile.verificationStatus) }
                            ]} />
                            <Text style={styles.statusText}>
                                {getStatusText(profile.verificationStatus)}
                            </Text>
                        </View>
                    </View>
                    {stats.reviewsCount > 0 && (
                        <View style={styles.ratingContainer}>
                            <Text style={styles.ratingNumber}>{stats.rating.toFixed(1)}</Text>
                            <Text style={styles.ratingStars}>★★★★★</Text>
                            <Text style={styles.ratingCount}>{stats.reviewsCount} отзывов</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.views}</Text>
                    <Text style={styles.statLabel}>Просмотры</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.clicks}</Text>
                    <Text style={styles.statLabel}>Клики</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.favorites}</Text>
                    <Text style={styles.statLabel}>В избранном</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Управление</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/photos')}
                    >
                        <Text style={styles.actionIcon}>📸</Text>
                        <Text style={styles.actionTitle}>Фотографии</Text>
                        <Text style={styles.actionSubtitle}>Галерея заведения</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/menu')}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionTitle}>Меню</Text>
                        <Text style={styles.actionSubtitle}>Услуги и товары</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/reviews')}
                    >
                        <Text style={styles.actionIcon}>⭐</Text>
                        <Text style={styles.actionTitle}>Отзывы</Text>
                        <Text style={styles.actionSubtitle}>Управление отзывами</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/pricing')}
                    >
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionTitle}>Цены</Text>
                        <Text style={styles.actionSubtitle}>Прайс-лист</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/staff')}
                    >
                        <Text style={styles.actionIcon}>👥</Text>
                        <Text style={styles.actionTitle}>Персонал</Text>
                        <Text style={styles.actionSubtitle}>Команда</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/business/settings')}
                    >
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionTitle}>Настройки</Text>
                        <Text style={styles.actionSubtitle}>Конфигурация</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Business Features */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Возможности заведения</Text>
                <View style={styles.featuresContainer}>
                    <View style={styles.featureRow}>
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureIcon}>🍽️</Text>
                            <Text style={styles.featureTitle}>Бронирование столиков</Text>
                        </View>
                        <Switch
                            value={profile.acceptsReservations}
                            onValueChange={(value) => updateBusinessSetting('acceptsReservations', value)}
                            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureIcon}>🚚</Text>
                            <Text style={styles.featureTitle}>Доставка</Text>
                        </View>
                        <Switch
                            value={profile.hasDelivery}
                            onValueChange={(value) => updateBusinessSetting('hasDelivery', value)}
                            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureIcon}>💳</Text>
                            <Text style={styles.featureTitle}>Оплата картой</Text>
                        </View>
                        <Switch
                            value={profile.acceptsCards}
                            onValueChange={(value) => updateBusinessSetting('acceptsCards', value)}
                            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>
            </View>



            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 32,
    },
    createButton: {
        backgroundColor: '#8B1538',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#8B1538',
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    tariffContainer: {
        marginBottom: 12,
    },
    tariffBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    tariffShine: {
        position: 'absolute',
        top: 0,
        left: -20,
        width: 20,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        transform: [{ skewX: '-20deg' }],
    },
    tariffEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    tariffText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    businessType: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    ratingContainer: {
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    ratingStars: {
        fontSize: 16,
        color: '#FFD700',
        marginVertical: 4,
    },
    ratingCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: -20,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
    },

    section: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (width - 52) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
    },
    featuresContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    featureInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1D1D1F',
    },

    bottomPadding: {
        height: 32,
    },
});