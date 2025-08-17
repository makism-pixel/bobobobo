import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

interface PlaceCardProps {
    name: string;
    category: string;
    rating: number;
    distance: string;
    price: string;
    address?: string;
    phone?: string;
    hours?: string;
    description?: string;
    isFavorite?: boolean;
    mainPhotoUri?: string;
    hasDelivery?: boolean;
    acceptsReservations?: boolean;
    onPress?: () => void;
    onFavoritePress?: () => void;
}

export default function PlaceCard({
    name,
    category,
    rating,
    distance,
    price,
    address,
    phone,
    hours,
    description,
    isFavorite = false,
    mainPhotoUri,
    hasDelivery = false,
    acceptsReservations = false,
    onPress,
    onFavoritePress
}: PlaceCardProps) {

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return '#34C759';
        if (rating >= 4.0) return '#FF9500';
        if (rating >= 3.5) return '#FF6B35';
        return '#8E8E93';
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

    const [imageError, setImageError] = useState(false);

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        onFavoritePress?.();
    };

    const handleImageError = (error: any) => {
        console.error('❌ expo-image error:', error, mainPhotoUri);
        setImageError(true);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.95}
        >
            <View style={styles.cardContent}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {mainPhotoUri && !imageError ? (
                        <Image
                            source={{ uri: mainPhotoUri }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                            onLoad={() => console.log('✅ expo-image loaded:', mainPhotoUri)}
                            onError={handleImageError}
                            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imageEmoji}>{getCategoryEmoji(category)}</Text>
                        </View>
                    )}
                    <View style={styles.ratingBadge}>
                        <Text style={[styles.ratingText, { color: getRatingColor(rating) }]}>
                            ★ {rating.toFixed(1)}
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.placeName} numberOfLines={1}>{name}</Text>
                        {onFavoritePress && (
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={handleFavoritePress}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.favoriteIcon,
                                    { color: isFavorite ? '#FF3B30' : '#C7C7CC' }
                                ]}>
                                    {isFavorite ? '❤️' : '🤍'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.category}>{category}</Text>
                    {description && (
                        <Text style={styles.description} numberOfLines={2}>{description}</Text>
                    )}
                    <View style={styles.details}>
                        <View style={styles.detailsLeft}>
                            <Text style={styles.distance}>{distance} • {price}</Text>
                        </View>
                        <View style={styles.detailsRight}>
                            {hasDelivery && (
                                <View style={styles.featureBadge}>
                                    <Text style={styles.featureIcon}>🚚</Text>
                                </View>
                            )}
                            {acceptsReservations && (
                                <View style={styles.featureBadge}>
                                    <Text style={styles.featureIcon}>🍽️</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Additional Info */}
            {(address || hours || phone) && (
                <View style={styles.additionalInfo}>
                    {address && (
                        <Text style={styles.address} numberOfLines={1}>📍 {address}</Text>
                    )}
                    {hours && (
                        <Text style={styles.hours}>🕐 {hours}</Text>
                    )}
                    {phone && (
                        <Text style={styles.phone}>📞 {phone}</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 0,
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        padding: 16,
    },

    // Card Content
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    // Image
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 16,
        position: 'relative',
        backgroundColor: '#F2F2F7',
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F2F7',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageEmoji: {
        fontSize: 32,
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Info
    info: {
        flex: 1,
        paddingTop: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    placeName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1D1D1F',
        flex: 1,
        marginRight: 8,
    },
    favoriteButton: {
        padding: 4,
        marginRight: -4,
    },
    favoriteIcon: {
        fontSize: 18,
    },
    category: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 4,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailsLeft: {
        flex: 1,
    },
    detailsRight: {
        flexDirection: 'row',
        gap: 8,
    },
    featureBadge: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    featureIcon: {
        fontSize: 14,
    },
    distance: {
        fontSize: 13,
        color: '#48484A',
        fontWeight: '500',
    },
    description: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 6,
        lineHeight: 16,
    },
    address: {
        fontSize: 11,
        color: '#8B1538',
        marginTop: 4,
        fontWeight: '500',
    },
    hours: {
        fontSize: 11,
        color: '#34C759',
        marginTop: 2,
        fontWeight: '500',
    },
    phone: {
        fontSize: 11,
        color: '#007AFF',
        marginTop: 2,
        fontWeight: '500',
    },

    // Additional Info
    additionalInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
}); 