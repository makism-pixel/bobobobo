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
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useUserRole } from '@/hooks/useUserRole';

interface BusinessApplication {
    id: string;
    businessName: string;
    businessType: string;
    description: string;
    phone: string;
    address: string;
    city: string;
    ownerName: string;
    userEmail?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    userId: string;
}

export default function AdminTab() {
    const { user } = useAuth();
    const { isAdmin, loading: roleLoading } = useUserRole();
    const [applications, setApplications] = useState<BusinessApplication[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [approvedPlaces, setApprovedPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'applications' | 'reviews' | 'places'>('applications');

    // Функции загрузки данных
    const loadApplications = () => {
        const q = query(collection(db, 'businessProfiles'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allApps: BusinessApplication[] = [];
            const pendingApps: BusinessApplication[] = [];

            snapshot.forEach((doc) => {
                const appData = {
                    id: doc.id,
                    ...doc.data()
                } as BusinessApplication;

                allApps.push(appData);

                if (appData.verificationStatus === 'pending') {
                    pendingApps.push(appData);
                }
            });

            // Сортируем по дате создания (новые первыми)
            pendingApps.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt?.toMillis() - a.createdAt?.toMillis();
            });

            setApplications(pendingApps);
            setLoading(false);
            setRefreshing(false);
        });

        return unsubscribe;
    };

    const loadReviews = () => {
        const q = query(
            collection(db, 'reviews'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Сортируем на клиенте по дате (новые первыми)
            reviewsData.sort((a: any, b: any) => {
                const dateA = a.timestamp?.toDate?.() || new Date(0);
                const dateB = b.timestamp?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            console.log('📝 Loaded', reviewsData.length, 'pending reviews for admin panel');
            setReviews(reviewsData);
        });

        return unsubscribe;
    };

    const loadApprovedPlaces = () => {
        const q = query(collection(db, 'approvedPlaces'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const placesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Сортируем на клиенте по названию
            placesData.sort((a: any, b: any) => {
                const nameA = a.businessName || '';
                const nameB = b.businessName || '';
                return nameA.localeCompare(nameB, 'ru');
            });

            setApprovedPlaces(placesData);
        });

        return unsubscribe;
    };

    useEffect(() => {
        console.log('🔍 Admin Tab - User:', user?.uid, 'Email:', user?.email, 'isAdmin:', isAdmin, 'roleLoading:', roleLoading);
    }, [user, isAdmin, roleLoading]);

    useEffect(() => {
        if (!user || roleLoading) return;

        if (!isAdmin) {
            console.log('❌ Access denied - not admin');
            return;
        }

        console.log('✅ Admin access granted, loading data...');

        const unsubscribeApps = loadApplications();
        const unsubscribeReviews = loadReviews();
        const unsubscribePlaces = loadApprovedPlaces();

        return () => {
            unsubscribeApps();
            unsubscribeReviews();
            unsubscribePlaces();
        };
    }, [user, isAdmin, roleLoading]);

    const handleApprove = async (applicationId: string, businessName: string) => {
        Alert.alert(
            'Одобрить заявку',
            `Вы уверены, что хотите одобрить заявку "${businessName}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Одобрить',
                    onPress: async () => {
                        try {
                            console.log('🔄 Approving application:', applicationId);

                            // Находим заявку для копирования данных
                            const application = applications.find(app => app.id === applicationId);
                            if (!application) {
                                Alert.alert('Ошибка', 'Заявка не найдена');
                                return;
                            }

                            // 1. Обновляем статус заявки
                            await updateDoc(doc(db, 'businessProfiles', applicationId), {
                                verificationStatus: 'approved',
                                isVerified: true,
                                updatedAt: new Date()
                            });
                            console.log('✅ Application status updated');

                            // 2. Формируем часы работы для отображения
                            const formatWorkingHours = (hours: any) => {
                                if (typeof hours === 'string') return hours; // Старый формат

                                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

                                const workingDays = days.map((day, index) => {
                                    const dayInfo = hours[day];
                                    if (dayInfo && !dayInfo.closed) {
                                        return `${dayNames[index]}: ${dayInfo.open}-${dayInfo.close}`;
                                    }
                                    return null;
                                }).filter(Boolean);

                                return workingDays.length > 0 ? workingDays.join(', ') : 'Часы не указаны';
                            };

                            // 3. Копируем в коллекцию одобренных мест
                            const approvedPlaceData = {
                                businessName: application.businessName,
                                businessType: application.businessType,
                                description: application.description,
                                phone: application.phone,
                                address: application.address,
                                city: application.city,
                                ownerName: application.ownerName,
                                userEmail: application.userEmail,
                                userId: application.userId,
                                businessId: applicationId, // Связь с меню

                                // Новые поля
                                photos: (application as any).photos || [],
                                website: (application as any).website || '',
                                instagram: (application as any).instagram || '',
                                facebook: (application as any).facebook || '',
                                workingHours: (application as any).workingHours || {},
                                features: (application as any).features || [], // Особенности заведения
                                acceptsReservations: (application as any).acceptsReservations || false,
                                hasDelivery: (application as any).hasDelivery || false,
                                acceptsCards: (application as any).acceptsCards || true,

                                // Поля для отображения
                                rating: 4.5 + Math.random() * 0.5,
                                hours: formatWorkingHours((application as any).workingHours),
                                price: '€€',
                                isOpen: true,
                                approvedAt: new Date(),
                                approvedBy: user?.email,

                                updatedAt: new Date()
                            };

                            await setDoc(doc(db, 'approvedPlaces', applicationId), approvedPlaceData);
                            console.log('✅ Added to approved places collection');

                            Alert.alert('Успех', `Заявка "${businessName}" одобрена и добавлена в список мест!`);
                        } catch (error) {
                            console.error('❌ Error approving application:', error);
                            Alert.alert('Ошибка', 'Не удалось одобрить заявку: ' + (error as Error).message);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (applicationId: string, businessName: string) => {
        Alert.alert(
            'Отклонить заявку',
            `Вы уверены, что хотите отклонить заявку "${businessName}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Отклонить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, 'businessProfiles', applicationId), {
                                verificationStatus: 'rejected',
                                isVerified: false,
                                updatedAt: new Date()
                            });
                            Alert.alert('Заявка отклонена', `Заявка "${businessName}" отклонена`);
                        } catch (error) {
                            console.error('Error rejecting application:', error);
                            Alert.alert('Ошибка', 'Не удалось отклонить заявку');
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Перезагружаем данные в зависимости от активной вкладки
        if (activeTab === 'applications') {
            loadApplications();
        } else if (activeTab === 'reviews') {
            loadReviews();
        } else if (activeTab === 'places') {
            loadApprovedPlaces();
        }
    };

    // Функции управления отзывами
    const handleApproveReview = async (reviewId: string, placeName: string) => {
        try {
            console.log('🔄 Approving review:', reviewId);
            await updateDoc(doc(db, 'reviews', reviewId), {
                status: 'approved',
                isVisible: true,
                moderatedAt: new Date()
            });

            console.log('✅ Review approved and should disappear from admin panel');
            Alert.alert('Успех', `Отзыв для ${placeName} одобрен`);
        } catch (error) {
            console.error('❌ Error approving review:', error);
            Alert.alert('Ошибка', 'Не удалось одобрить отзыв');
        }
    };

    const handleRejectReview = async (reviewId: string, placeName: string) => {
        try {
            await updateDoc(doc(db, 'reviews', reviewId), {
                status: 'rejected',
                isVisible: false,
                moderatedAt: new Date()
            });

            Alert.alert('Успех', `Отзыв для ${placeName} отклонен`);
        } catch (error) {
            console.error('❌ Error rejecting review:', error);
            Alert.alert('Ошибка', 'Не удалось отклонить отзыв');
        }
    };

    // Функция удаления заведения
    const handleDeletePlace = async (placeId: string, placeName: string) => {
        Alert.alert(
            'Удалить заведение?',
            `Вы уверены, что хотите удалить "${placeName}"? Это действие нельзя отменить.`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'approvedPlaces', placeId));
                            Alert.alert('Успех', `Заведение "${placeName}" удалено`);
                        } catch (error) {
                            console.error('❌ Error deleting place:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить заведение');
                        }
                    }
                }
            ]
        );
    };

    // Отладка и состояние загрузки
    if (roleLoading) {
        console.log('⏳ Role still loading...');
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Админ-панель</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Проверяем права доступа...</Text>
                </View>
            </View>
        );
    }

    // Проверка прав администратора
    if (!isAdmin) {
        console.log('❌ Access denied for email:', user?.email);
        console.log('📧 Expected admin email: malina@gmail.com');
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Доступ запрещен</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>🚫</Text>
                    <Text style={styles.errorTitle}>Нет прав доступа</Text>
                    <Text style={styles.errorText}>
                        У вас нет прав для просмотра админ-панели.{'\n\n'}
                        Текущий email: {user?.email || 'не определен'}{'\n'}
                        Требуется: malina@gmail.com
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={styles.backButtonText}>← На главную</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    console.log('✅ Admin access granted for:', user?.email);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B1538" />
                <Text style={styles.loadingText}>Загружаем заявки...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Админ-панель</Text>
                <Text style={styles.subtitle}>{user?.email}</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
                    onPress={() => setActiveTab('applications')}
                >
                    <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
                        Заявки ({applications.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                    onPress={() => setActiveTab('reviews')}
                >
                    <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                        Отзывы ({reviews.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'places' && styles.activeTab]}
                    onPress={() => setActiveTab('places')}
                >
                    <Text style={[styles.tabText, activeTab === 'places' && styles.activeTabText]}>
                        Заведения ({approvedPlaces.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                {activeTab === 'applications' && (
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{applications.length}</Text>
                        <Text style={styles.statLabel}>Заявок на рассмотрении</Text>
                    </View>
                )}
                {activeTab === 'reviews' && (
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{reviews.length}</Text>
                        <Text style={styles.statLabel}>Отзывов на модерации</Text>
                    </View>
                )}
                {activeTab === 'places' && (
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{approvedPlaces.length}</Text>
                        <Text style={styles.statLabel}>Одобренных заведений</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    applications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>✅</Text>
                            <Text style={styles.emptyTitle}>Все заявки обработаны</Text>
                            <Text style={styles.emptySubtitle}>
                                Новые заявки на регистрацию бизнеса появятся здесь
                            </Text>
                        </View>
                    ) : (
                        applications.map((app) => (
                            <View key={app.id} style={styles.applicationCard}>
                                <View style={styles.applicationHeader}>
                                    <Text style={styles.businessName}>{app.businessName}</Text>
                                    <Text style={styles.businessType}>{app.businessType}</Text>
                                </View>

                                {/* Фотографии заведения */}
                                {(app as any).photos && (app as any).photos.length > 0 && (
                                    <View style={styles.photosContainer}>
                                        <Text style={styles.photosTitle}>📸 Фотографии ({(app as any).photos.length})</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                                            {(app as any).photos.map((photo: string, index: number) => (
                                                <Image
                                                    key={index}
                                                    source={{ uri: photo }}
                                                    style={styles.photoThumbnail}
                                                    resizeMode="cover"
                                                />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.applicationDetails}>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Владелец: </Text>
                                        {app.ownerName}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Телефон: </Text>
                                        {app.phone}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Адрес: </Text>
                                        {app.address}, {app.city}
                                    </Text>

                                    {/* Дополнительные контакты */}
                                    {(app as any).website && (
                                        <Text style={styles.detailText}>
                                            <Text style={styles.detailLabel}>Сайт: </Text>
                                            {(app as any).website}
                                        </Text>
                                    )}
                                    {(app as any).instagram && (
                                        <Text style={styles.detailText}>
                                            <Text style={styles.detailLabel}>Instagram: </Text>
                                            {(app as any).instagram}
                                        </Text>
                                    )}

                                    {/* Часы работы */}
                                    {(app as any).workingHours && (
                                        <View style={styles.workingHoursContainer}>
                                            <Text style={styles.detailLabel}>⏰ Часы работы:</Text>
                                            {Object.entries((app as any).workingHours).map(([day, hours]: [string, any]) => {
                                                const dayNames: { [key: string]: string } = {
                                                    monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср',
                                                    thursday: 'Чт', friday: 'Пт', saturday: 'Сб', sunday: 'Вс'
                                                };
                                                return (
                                                    <Text key={day} style={styles.hoursText}>
                                                        {dayNames[day]}: {hours.closed ? 'Закрыто' : `${hours.open} - ${hours.close}`}
                                                    </Text>
                                                );
                                            })}
                                        </View>
                                    )}

                                    {/* Услуги */}
                                    <View style={styles.servicesContainer}>
                                        <Text style={styles.detailLabel}>🔧 Услуги:</Text>
                                        <Text style={styles.servicesText}>
                                            {(app as any).acceptsReservations && '🪑 Бронирования '}
                                            {(app as any).hasDelivery && '🚚 Доставка '}
                                            {(app as any).acceptsCards && '💳 Карты '}
                                        </Text>
                                    </View>

                                    {app.description && (
                                        <Text style={styles.detailText}>
                                            <Text style={styles.detailLabel}>Описание: </Text>
                                            {app.description}
                                        </Text>
                                    )}
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Подана: </Text>
                                        {app.createdAt?.toDate().toLocaleDateString('ru-RU')}
                                    </Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleReject(app.id, app.businessName)}
                                    >
                                        <Text style={styles.rejectButtonText}>❌ Отклонить</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.approveButton]}
                                        onPress={() => handleApprove(app.id, app.businessName)}
                                    >
                                        <Text style={styles.approveButtonText}>✅ Одобрить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    reviews.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyTitle}>Нет отзывов на модерации</Text>
                            <Text style={styles.emptySubtitle}>
                                Новые отзывы для модерации появятся здесь
                            </Text>
                        </View>
                    ) : (
                        reviews.map((review: any) => (
                            <View key={review.id} style={styles.applicationCard}>
                                <View style={styles.applicationHeader}>
                                    <Text style={styles.businessName}>
                                        Отзыв для: {review.placeName}
                                    </Text>
                                    <Text style={styles.businessType}>
                                        ⭐ {review.rating}/5 - {review.userName}
                                    </Text>
                                </View>

                                <View style={styles.applicationDetails}>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Автор: </Text>
                                        {review.userName} ({review.userEmail})
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Дата: </Text>
                                        {review.timestamp?.toDate()?.toLocaleDateString('ru-RU')}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Комментарий: </Text>
                                        {review.comment}
                                    </Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleRejectReview(review.id, review.placeName)}
                                    >
                                        <Text style={styles.rejectButtonText}>❌ Отклонить</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.approveButton]}
                                        onPress={() => handleApproveReview(review.id, review.placeName)}
                                    >
                                        <Text style={styles.approveButtonText}>✅ Одобрить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )
                )}

                {/* Places Tab */}
                {activeTab === 'places' && (
                    approvedPlaces.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🏢</Text>
                            <Text style={styles.emptyTitle}>Нет одобренных заведений</Text>
                            <Text style={styles.emptySubtitle}>
                                Одобренные заведения появятся здесь
                            </Text>
                        </View>
                    ) : (
                        approvedPlaces.map((place: any) => (
                            <View key={place.id} style={styles.applicationCard}>
                                <View style={styles.applicationHeader}>
                                    <Text style={styles.businessName}>{place.businessName}</Text>
                                    <Text style={styles.businessType}>{place.businessType}</Text>
                                </View>

                                <View style={styles.applicationDetails}>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Владелец: </Text>
                                        {place.ownerName}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Телефон: </Text>
                                        {place.phone}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Адрес: </Text>
                                        {place.address}, {place.city}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Рейтинг: </Text>
                                        ⭐ {place.rating || 'Нет оценок'}
                                    </Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleDeletePlace(place.id, place.businessName)}
                                    >
                                        <Text style={styles.rejectButtonText}>🗑️ Удалить</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 4,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
    },

    // Access Denied
    accessDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
    },
    accessDeniedIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    accessDeniedTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    accessDeniedText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },
    accessDeniedEmail: {
        fontSize: 14,
        color: '#48484A',
        textAlign: 'center',
        marginBottom: 16,
    },
    accessDeniedHint: {
        fontSize: 12,
        color: '#8B1538',
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Stats
    statsContainer: {
        padding: 24,
    },
    statCard: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 4,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Application Card
    applicationCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    applicationHeader: {
        marginBottom: 12,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    businessType: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '600',
    },

    // Photos
    photosContainer: {
        marginBottom: 12,
    },
    photosTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    photosScroll: {
        flexDirection: 'row',
    },
    photoThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#F2F2F7',
    },

    // Details
    applicationDetails: {
        marginBottom: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#48484A',
        marginBottom: 4,
        lineHeight: 20,
    },
    detailLabel: {
        fontWeight: '600',
        color: '#1D1D1F',
    },

    // Working Hours
    workingHoursContainer: {
        marginVertical: 8,
        paddingLeft: 8,
    },
    hoursText: {
        fontSize: 12,
        color: '#48484A',
        marginBottom: 2,
    },

    // Services
    servicesContainer: {
        marginVertical: 8,
        paddingLeft: 8,
    },
    servicesText: {
        fontSize: 12,
        color: '#48484A',
        marginTop: 4,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    approveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    rejectButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // New styles for error message
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
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
    errorText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    backButton: {
        backgroundColor: '#8B1538',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#8B1538',
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#8B1538',
        fontWeight: '600',
    },
}); 