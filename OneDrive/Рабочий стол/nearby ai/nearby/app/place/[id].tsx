import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
    Linking,
    Alert,
    Dimensions
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ApprovedBusiness } from '@/types';
import { useFavorites } from '@/contexts/FavoritesContext';
import LayoutViewer from '@/components/LayoutViewer';
import ReviewForm from '@/components/ReviewForm';

const { width } = Dimensions.get('window');

export default function PlaceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [place, setPlace] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews'>('overview');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [placeReviews, setPlaceReviews] = useState<any[]>([]);

    useEffect(() => {
        loadPlaceDetails();
    }, [id]);

    useEffect(() => {
        if (place) {
            // Используем businessId если есть, иначе используем id места
            const businessIdToUse = place.businessId || place.id;
            if (businessIdToUse) {
                loadMenuItems(businessIdToUse);
            }
            loadPlaceReviews();
        }
    }, [place]);

    const loadPlaceDetails = async () => {
        try {
            if (!id) return;

            // Загружаем из Firebase
            const docRef = doc(db, 'approvedPlaces', id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const placeData = {
                    id: docSnap.id,
                    ...docSnap.data()
                } as ApprovedBusiness;
                setPlace(placeData);
            }
        } catch (error) {
            console.error('Error loading place details:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMenuItems = (businessId: string) => {
        try {
            console.log('Loading menu for business:', businessId);
            const q = query(
                collection(db, 'businessMenu'),
                where('businessId', '==', businessId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const items: any[] = [];
                snapshot.forEach((doc) => {
                    items.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Группируем элементы меню по категориям
                const groupedMenu = items.reduce((acc, item) => {
                    const category = item.category || 'Другое';
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(item);
                    return acc;
                }, {} as Record<string, any[]>);

                // Преобразуем в формат для отображения
                const menuCategories = Object.entries(groupedMenu).map(([category, items]) => ({
                    category,
                    items
                }));

                setMenuItems(menuCategories);
                setMenuLoading(false);
                console.log('✅ Menu loaded:', menuCategories.length, 'categories');
            }, (error) => {
                console.error('❌ Error loading menu:', error);
                setMenuLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up menu listener:', error);
            setMenuLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleDirections = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    };

    const handleFavoritePress = () => {
        if (place) {
            toggleFavorite(place);
        }
    };

    const loadPlaceReviews = async () => {
        try {
            if (!id) return;

            // Загружаем отзывы из коллекции reviews по placeId
            const reviewsQuery = query(
                collection(db, 'reviews'),
                where('placeId', '==', id),
                where('status', '==', 'approved'),
                where('isVisible', '==', true)
            );

            const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
                const reviews = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a: any, b: any) => new Date(b.timestamp?.toDate() || 0).getTime() - new Date(a.timestamp?.toDate() || 0).getTime());

                setPlaceReviews(reviews);
                console.log('✅ Loaded', reviews.length, 'approved reviews for place');
            });

            return unsubscribe;
        } catch (error) {
            console.error('❌ Error loading reviews:', error);
        }
    };

    const handleReviewAdded = () => {
        // Обновляем отзывы после добавления нового
        loadPlaceReviews();
    };

    const getCategoryEmoji = (category: string) => {
        switch (category.toLowerCase()) {
            case 'кафе': return '☕';
            case 'ресторан': return '🍽️';
            case 'пицца': return '🍕';
            case 'магазин': return '🛍️';
            case 'заправка': return '⛽';
            case 'кино': return '🎬';
            default: return '📍';
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return '#34C759';
        if (rating >= 4.0) return '#FF9500';
        if (rating >= 3.5) return '#FF6B35';
        return '#8E8E93';
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={[styles.star, { color: i <= rating ? '#FFD700' : '#E5E5EA' }]}>
                    ★
                </Text>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
        );
    }

    if (!place) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>😕</Text>
                <Text style={styles.errorTitle}>Место не найдено</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>← Назад</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <Text style={styles.headerButtonText}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.headerButton, place && isFavorite(place.id) && styles.favoriteActive]}
                    onPress={handleFavoritePress}
                >
                    <Text style={[
                        styles.headerButtonText,
                        { fontSize: 18 },
                        place && isFavorite(place.id) && styles.favoriteActiveText
                    ]}>
                        {place && isFavorite(place.id) ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.imageContainer}>
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imageEmoji}>{getCategoryEmoji(place.businessType)}</Text>
                        </View>
                        <View style={styles.photoGallery}>
                            {(place.photos || []).slice(0, 4).map((photo: string, index: number) => (
                                <View key={index} style={styles.photoItem}>
                                    <Text style={styles.photoEmoji}>{photo}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.heroContent}>
                        <Text style={styles.placeName}>{place.businessName}</Text>
                        <Text style={styles.category}>{place.businessType}</Text>

                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingBadge}>
                                <View style={styles.stars}>
                                    {renderStars(Math.floor(place.rating || 4.5))}
                                </View>
                                <Text style={[styles.ratingText, { color: getRatingColor(place.rating || 4.5) }]}>
                                    {place.rating || 4.5}
                                </Text>
                            </View>
                            <Text style={styles.reviewCount}>
                                ({placeReviews.length} {placeReviews.length === 1 ? 'отзыв' : placeReviews.length < 5 ? 'отзыва' : 'отзывов'})
                            </Text>
                        </View>

                        <Text style={styles.description}>{place.description}</Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfoSection}>
                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoIcon}>🕐</Text>
                        <View style={styles.quickInfoText}>
                            <Text style={styles.quickInfoTitle}>Часы работы</Text>
                            <Text style={styles.quickInfoSubtitle}>{place.hours || '9:00 - 22:00'}</Text>
                        </View>
                        <Text style={styles.openBadge}>Открыто</Text>
                    </View>

                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoIcon}>📍</Text>
                        <View style={styles.quickInfoText}>
                            <Text style={styles.quickInfoTitle}>Адрес</Text>
                            <Text style={styles.quickInfoSubtitle}>{place.address}, {place.city}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDirections(`${place.address}, ${place.city}`)}
                        >
                            <Text style={styles.actionButtonText}>Маршрут</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.quickInfoCard}>
                        <Text style={styles.quickInfoIcon}>📞</Text>
                        <View style={styles.quickInfoText}>
                            <Text style={styles.quickInfoTitle}>Телефон</Text>
                            <Text style={styles.quickInfoSubtitle}>{place.phone}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleCall(place.phone)}
                        >
                            <Text style={styles.actionButtonText}>Звонок</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                            Обзор
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
                        onPress={() => setActiveTab('menu')}
                    >
                        <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
                            Меню
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                            Отзывы {placeReviews.length > 0 ? `(${placeReviews.length})` : ''}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <View style={styles.tabContent}>
                        {/* Business Info Cards */}
                        <View style={styles.businessInfoGrid}>
                            {/* Reservation Card */}
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardHeader}>
                                    <View style={[styles.infoCardIcon, { backgroundColor: '#34C759' }]}>
                                        <Text style={styles.infoCardEmoji}>🍽️</Text>
                                    </View>
                                    <Text style={styles.infoCardTitle}>Бронирование</Text>
                                </View>
                                <Text style={styles.infoCardStatus}>
                                    {place.acceptsReservations ? '✅ Принимаем' : '❌ Не принимаем'}
                                </Text>
                                {place.acceptsReservations && (
                                    <TouchableOpacity style={styles.infoCardButton}>
                                        <Text style={styles.infoCardButtonText}>Забронировать столик</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Delivery Card */}
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardHeader}>
                                    <View style={[styles.infoCardIcon, { backgroundColor: '#FF9500' }]}>
                                        <Text style={styles.infoCardEmoji}>🚚</Text>
                                    </View>
                                    <Text style={styles.infoCardTitle}>Доставка</Text>
                                </View>
                                <Text style={styles.infoCardStatus}>
                                    {place.hasDelivery ? '✅ Доставляем' : '❌ Только самовывоз'}
                                </Text>
                                {place.hasDelivery && (
                                    <View style={styles.deliveryInfo}>
                                        <Text style={styles.deliveryDetail}>⏱️ 30-45 мин</Text>
                                        <Text style={styles.deliveryDetail}>💰 От €5</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <View style={styles.paymentSection}>
                            <Text style={styles.sectionTitle}>Способы оплаты</Text>
                            <View style={styles.paymentMethods}>
                                <View style={styles.paymentMethod}>
                                    <View style={[styles.paymentIcon, { backgroundColor: place.acceptsCards ? '#34C759' : '#8E8E93' }]}>
                                        <Text style={styles.paymentEmoji}>💳</Text>
                                    </View>
                                    <Text style={styles.paymentText}>Банковские карты</Text>
                                    <Text style={styles.paymentStatus}>
                                        {place.acceptsCards ? '✅' : '❌'}
                                    </Text>
                                </View>
                                <View style={styles.paymentMethod}>
                                    <View style={[styles.paymentIcon, { backgroundColor: '#34C759' }]}>
                                        <Text style={styles.paymentEmoji}>💵</Text>
                                    </View>
                                    <Text style={styles.paymentText}>Наличные</Text>
                                    <Text style={styles.paymentStatus}>✅</Text>
                                </View>
                            </View>
                        </View>

                        {/* Contact Info */}
                        <View style={styles.contactSection}>
                            <Text style={styles.sectionTitle}>Контакты</Text>
                            <View style={styles.contactInfo}>
                                <TouchableOpacity
                                    style={styles.contactItem}
                                    onPress={() => Linking.openURL(`tel:${place.phone}`)}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: '#007AFF' }]}>
                                        <Text style={styles.contactEmoji}>📞</Text>
                                    </View>
                                    <View style={styles.contactDetails}>
                                        <Text style={styles.contactLabel}>Телефон</Text>
                                        <Text style={styles.contactValue}>{place.phone}</Text>
                                    </View>
                                    <Text style={styles.contactArrow}>›</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.contactItem}
                                    onPress={() => {
                                        const address = `${place.address}, ${place.city}`;
                                        const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: '#FF3B30' }]}>
                                        <Text style={styles.contactEmoji}>📍</Text>
                                    </View>
                                    <View style={styles.contactDetails}>
                                        <Text style={styles.contactLabel}>Адрес</Text>
                                        <Text style={styles.contactValue}>{place.address}</Text>
                                        <Text style={styles.contactCity}>{place.city}</Text>
                                    </View>
                                    <Text style={styles.contactArrow}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Description */}
                        {place.description && (
                            <View style={styles.descriptionSection}>
                                <Text style={styles.sectionTitle}>О заведении</Text>
                                <View style={styles.descriptionCard}>
                                    <Text style={styles.descriptionText}>{place.description}</Text>
                                </View>
                            </View>
                        )}

                        {/* Popular Dishes */}
                        {menuItems && menuItems.length > 0 && (
                            <View style={styles.popularSection}>
                                <Text style={styles.sectionTitle}>Популярные блюда</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {menuItems.flatMap((category: any) =>
                                        category.items
                                            ?.filter((item: any) => item.isPopular)
                                            ?.map((item: any) => (
                                                <View key={item.id} style={styles.popularItem}>
                                                    <View style={styles.popularItemImage}>
                                                        <Text style={styles.popularItemEmoji}>🍕</Text>
                                                    </View>
                                                    <Text style={styles.popularItemName}>{item.name}</Text>
                                                    <Text style={styles.popularItemPrice}>€{item.price}</Text>
                                                </View>
                                            )) || []
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'menu' && (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Меню</Text>
                        {menuLoading ? (
                            <Text style={styles.loadingMenuText}>Загружаем меню...</Text>
                        ) : menuItems.length > 0 ? (
                            menuItems.map((category: any) => (
                                <View key={category.category} style={styles.menuCategory}>
                                    <Text style={styles.menuCategoryTitle}>{category.category}</Text>
                                    {category.items.map((item: any) => (
                                        <View key={item.id} style={styles.menuItem}>
                                            <View style={styles.menuItemContent}>
                                                <Text style={styles.menuItemName}>{item.name}</Text>
                                                <Text style={styles.menuItemDescription}>{item.description}</Text>
                                            </View>
                                            <Text style={styles.menuItemPrice}>€{item.price}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noMenuText}>Меню отсутствует.</Text>
                        )}
                    </View>
                )}

                {activeTab === 'reviews' && (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>
                            Отзывы посетителей {placeReviews.length > 0 && `(${placeReviews.length})`}
                        </Text>
                        {placeReviews.length > 0 ? placeReviews.map((review: any) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAvatar}>
                                        <Text style={styles.reviewAvatarText}>
                                            {review.userName ? review.userName.charAt(0).toUpperCase() : '👤'}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewInfo}>
                                        <Text style={styles.reviewAuthor}>
                                            {review.userName || 'Пользователь'}
                                        </Text>
                                        <View style={styles.reviewRating}>
                                            {renderStars(review.rating)}
                                            <Text style={styles.reviewDate}>
                                                {review.timestamp?.toDate()?.toLocaleDateString('ru-RU') || 'Недавно'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{review.comment}</Text>
                            </View>
                        )) : (
                            <View style={styles.noReviewsContainer}>
                                <Text style={styles.noReviewsText}>Отзывов пока нет</Text>
                                <Text style={styles.noReviewsSubtext}>
                                    Станьте первым, кто оставит отзыв о этом месте!
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(place.phone)}
                >
                    <Text style={styles.callButtonText}>📞 Позвонить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => handleDirections(`${place.address}, ${place.city}`)}
                >
                    <Text style={styles.directionsButtonText}>🗺️ Маршрут</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => setShowReviewForm(true)}
                >
                    <Text style={styles.reviewButtonText}>⭐ Отзыв</Text>
                </TouchableOpacity>
            </View>

            {/* Review Form Modal */}
            <ReviewForm
                placeId={place.id}
                placeName={place.businessName}
                visible={showReviewForm}
                onClose={() => setShowReviewForm(false)}
                onReviewAdded={handleReviewAdded}
            />
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
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    favoriteActive: {
        backgroundColor: '#FFD700', // Gold color for active favorite
    },
    favoriteActiveText: {
        color: '#1D1D1F', // Dark text for active favorite
    },
    content: {
        flex: 1,
    },

    // Hero Section
    heroSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 16,
    },
    imageContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageEmoji: {
        fontSize: 64,
    },
    photoGallery: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        gap: 6,
    },
    photoItem: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoEmoji: {
        fontSize: 16,
    },
    heroContent: {
        alignItems: 'flex-start',
    },
    placeName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    category: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 6,
    },
    star: {
        fontSize: 14,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    description: {
        fontSize: 16,
        color: '#48484A',
        lineHeight: 24,
    },

    // Quick Info
    quickInfoSection: {
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        paddingVertical: 8,
    },
    quickInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    quickInfoIcon: {
        fontSize: 24,
        marginRight: 16,
        width: 32,
        textAlign: 'center',
    },
    quickInfoText: {
        flex: 1,
    },
    quickInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 2,
    },
    quickInfoSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    openBadge: {
        backgroundColor: '#34C759',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    actionButton: {
        backgroundColor: '#8B1538',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
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
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#8B1538',
    },

    // Tab Content
    tabContent: {
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
        paddingHorizontal: 20,
    },

    // Features
    featuresSection: {
        marginBottom: 32,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: '45%',
    },
    featureIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#1D1D1F',
        fontWeight: '500',
    },

    // Popular Items
    popularSection: {
        marginBottom: 20,
    },
    popularItem: {
        alignItems: 'center',
        marginLeft: 20,
        width: 100,
    },
    popularItemImage: {
        width: 80,
        height: 80,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    popularItemEmoji: {
        fontSize: 32,
    },
    popularItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 4,
    },
    popularItemPrice: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '600',
    },

    // Menu
    menuCategory: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    menuCategoryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    menuItemContent: {
        flex: 1,
        marginRight: 12,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B1538',
    },
    noMenuText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    noReviewsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 8,
    },
    noReviewsSubtext: {
        fontSize: 14,
        color: '#A0A0A0',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingMenuText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },

    // Reviews
    reviewCard: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reviewAvatarText: {
        fontSize: 20,
    },
    reviewInfo: {
        flex: 1,
    },
    reviewAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: '#8E8E93',
    },
    reviewText: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        gap: 12,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#34C759',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    callButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    directionsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    reviewButton: {
        flex: 1,
        backgroundColor: '#FF9500',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Loading & Error
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F7',
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 40,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 24,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // New Business Info Styles
    businessInfoGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    infoCardEmoji: {
        fontSize: 16,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    infoCardStatus: {
        fontSize: 14,
        color: '#48484A',
        marginBottom: 12,
    },
    infoCardButton: {
        backgroundColor: '#8B1538',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    infoCardButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    deliveryInfo: {
        flexDirection: 'row',
        gap: 12,
    },
    deliveryDetail: {
        fontSize: 12,
        color: '#8E8E93',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    // Payment Methods
    paymentSection: {
        marginBottom: 24,
    },
    paymentMethods: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    paymentIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    paymentEmoji: {
        fontSize: 16,
    },
    paymentText: {
        flex: 1,
        fontSize: 16,
        color: '#1D1D1F',
    },
    paymentStatus: {
        fontSize: 16,
    },

    // Contact Info
    contactSection: {
        marginBottom: 24,
    },
    contactInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contactEmoji: {
        fontSize: 18,
    },
    contactDetails: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1D1D1F',
    },
    contactCity: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    contactArrow: {
        fontSize: 20,
        color: '#C7C7CC',
    },

    // Description
    descriptionSection: {
        marginBottom: 24,
    },
    descriptionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    descriptionText: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },
}); 