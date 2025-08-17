import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from 'react-native';
import { router } from 'expo-router';

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    isReported: boolean;
}

export default function BusinessReviewsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [reviews] = useState<Review[]>([]);

    const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
        reviews.filter(review => review.rating === rating).length
    );

    const onRefresh = () => {
        setRefreshing(true);
        // Имитация загрузки
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return '#34C759';
        if (rating >= 3) return '#FF9500';
        return '#FF3B30';
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Text key={index} style={[
                styles.star,
                { color: index < rating ? '#FFD700' : '#E5E5EA' }
            ]}>
                ★
            </Text>
        ));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Отзывы</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Overall Rating */}
                <View style={styles.overallSection}>
                    <View style={styles.ratingHeader}>
                        <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                        <View style={styles.starsContainer}>
                            {renderStars(Math.round(averageRating))}
                        </View>
                        <Text style={styles.reviewCount}>На основе {reviews.length} отзывов</Text>
                    </View>

                    <View style={styles.ratingBreakdown}>
                        {[5, 4, 3, 2, 1].map((rating, index) => (
                            <View key={rating} style={styles.ratingRow}>
                                <Text style={styles.ratingNumber}>{rating}</Text>
                                <Text style={styles.ratingStar}>★</Text>
                                <View style={styles.ratingBar}>
                                    <View
                                        style={[
                                            styles.ratingBarFill,
                                            {
                                                width: `${(ratingCounts[index] / reviews.length) * 100}%`,
                                                backgroundColor: getRatingColor(rating)
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.ratingCount}>{ratingCounts[index]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Reviews List */}
                <View style={styles.reviewsSection}>
                    <Text style={styles.sectionTitle}>Последние отзывы</Text>

                    {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewUser}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.userInitial}>
                                            {review.userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{review.userName}</Text>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.reviewRating}>
                                    {renderStars(review.rating)}
                                </View>
                            </View>

                            <Text style={styles.reviewComment}>{review.comment}</Text>

                            <View style={styles.reviewActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Text style={styles.actionButtonText}>💬 Ответить</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Text style={styles.actionButtonText}>🚨 Пожаловаться</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.tipsSection}>
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsIcon}>💡</Text>
                        <View style={styles.tipsContent}>
                            <Text style={styles.tipsTitle}>Как работать с отзывами</Text>
                            <Text style={styles.tipsText}>
                                • Отвечайте на все отзывы, особенно негативные{'\n'}
                                • Будьте вежливы и профессиональны{'\n'}
                                • Предлагайте решения проблем{'\n'}
                                • Благодарите за положительные отзывы
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    placeholder: {
        width: 50,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Overall Rating
    overallSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginVertical: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    ratingHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    averageRating: {
        fontSize: 48,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    star: {
        fontSize: 20,
        marginHorizontal: 2,
    },
    reviewCount: {
        fontSize: 16,
        color: '#8E8E93',
    },
    ratingBreakdown: {
        gap: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        width: 12,
    },
    ratingStar: {
        fontSize: 14,
        color: '#FFD700',
    },
    ratingBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 4,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    ratingCount: {
        fontSize: 14,
        color: '#8E8E93',
        width: 20,
        textAlign: 'right',
    },

    // Reviews
    reviewsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: 40,
        height: 40,
        backgroundColor: '#8B1538',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userInitial: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    reviewRating: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 15,
        color: '#1D1D1F',
        lineHeight: 22,
        marginBottom: 16,
    },
    reviewActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B1538',
    },

    // Tips
    tipsSection: {
        marginBottom: 24,
    },
    tipsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    tipsIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    tipsContent: {
        flex: 1,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
}); 