import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, Easing, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';

// Динамический импорт карты только для нативных платформ
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
    const MapComponents = require('react-native-maps');
    MapView = MapComponents.default;
    Marker = MapComponents.Marker;
    PROVIDER_GOOGLE = MapComponents.PROVIDER_GOOGLE;
}

interface Place {
    id: string;
    name: string;
    category: string;
    rating: number;
    distance: string;
    price: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
}

interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export default function MapScreen() {
    const mapRef = useRef<any>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [cardAnimation] = useState(new Animated.Value(0));
    const [markerAnimations] = useState(() =>
        Array.from({ length: 4 }, () => new Animated.Value(0))
    );
    const [mapRegion, setMapRegion] = useState({
        latitude: 56.9496, // Рига по умолчанию
        longitude: 24.1052,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
    });

    // Места будут загружаться из Firebase
    const nearbyPlaces: Place[] = [];

    useEffect(() => {
        if (Platform.OS === 'web') {
            // На веб показываем заглушку
            setErrorMsg('Карта доступна только в мобильном приложении');
            return;
        }

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Доступ к геолокации отклонен');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(currentLocation);

            // Очень плавный переход к текущему местоположению
            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            };

            setMapRegion(newRegion);

            // Анимированный переход камеры с задержкой
            setTimeout(() => {
                mapRef.current?.animateToRegion(newRegion, 2500);
            }, 800);
        })();

        // Ультра плавная анимация появления маркеров
        markerAnimations.forEach((animation, index) => {
            Animated.timing(animation, {
                toValue: 1,
                duration: 1200,
                delay: index * 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });
    }, []);

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

    const handleLocationPress = async () => {
        if (Platform.OS === 'web') {
            Alert.alert('Недоступно', 'Геолокация доступна только в мобильном приложении');
            return;
        }

        try {
            let currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(currentLocation);

            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
            };

            // Максимально плавная анимация к местоположению
            mapRef.current?.animateToRegion(newRegion, 2000);

            // Плавное обновление состояния
            Animated.timing(new Animated.Value(0), {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }).start(() => {
                setMapRegion(newRegion);
            });
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось получить местоположение');
        }
    };

    const handleMarkerPress = (place: Place, index: number) => {
        setSelectedPlace(place);

        if (Platform.OS !== 'web') {
            // Супер мягкое движение к выбранному месту
            const targetRegion = {
                latitude: place.coordinate.latitude,
                longitude: place.coordinate.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
            };

            mapRef.current?.animateToRegion(targetRegion, 1800);
        }

        // Ультра плавная анимация карточки
        Animated.timing(cardAnimation, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
        }).start();

        // Мягкая анимация маркера
        Animated.sequence([
            Animated.timing(markerAnimations[index], {
                toValue: 1.4,
                duration: 400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(markerAnimations[index], {
                toValue: 1.15,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    };

    const hideCard = () => {
        Animated.timing(cardAnimation, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setSelectedPlace(null);
        });

        // Возвращаем все маркеры к обычному размеру плавно
        markerAnimations.forEach((animation, index) => {
            Animated.timing(animation, {
                toValue: 1,
                duration: 500,
                delay: index * 50,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });
    };

    const handleRegionChange = (region: Region) => {
        // Плавное обновление только при значительных изменениях
        const isSignificantChange =
            Math.abs(region.latitude - mapRegion.latitude) > 0.001 ||
            Math.abs(region.longitude - mapRegion.longitude) > 0.001;

        if (isSignificantChange) {
            setMapRegion(region);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return '#34C759';
        if (rating >= 4.0) return '#FF9500';
        if (rating >= 3.5) return '#FF6B35';
        return '#8E8E93';
    };

    // Веб-заглушка
    const WebMapPlaceholder = () => (
        <View style={styles.webPlaceholder}>
            <View style={styles.webPlaceholderContent}>
                <Text style={styles.webPlaceholderEmoji}>📱</Text>
                <Text style={styles.webPlaceholderTitle}>Карта доступна в приложении</Text>
                <Text style={styles.webPlaceholderSubtitle}>
                    Для просмотра интерактивной карты откройте приложение на смартфоне
                </Text>
                <TouchableOpacity
                    style={styles.webDownloadButton}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={styles.webDownloadButtonText}>📲 Перейти к главной</Text>
                </TouchableOpacity>
            </View>

            {/* Показываем места списком */}
            <View style={styles.webPlacesList}>
                <Text style={styles.webPlacesTitle}>🗺️ Места рядом с вами:</Text>
                {nearbyPlaces.map((place) => (
                    <TouchableOpacity
                        key={place.id}
                        style={styles.webPlaceItem}
                        onPress={() => handleMarkerPress(place, 0)}
                    >
                        <Text style={styles.webPlaceEmoji}>{getCategoryEmoji(place.category)}</Text>
                        <View style={styles.webPlaceInfo}>
                            <Text style={styles.webPlaceName}>{place.name}</Text>
                            <Text style={styles.webPlaceDetails}>
                                {place.category} • ⭐ {place.rating} • {place.distance} • {place.price}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Карта</Text>
                <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
                    <Text style={styles.locationButtonText}>📍 Моё местоположение</Text>
                </TouchableOpacity>
            </View>

            {/* Map or Web Placeholder */}
            <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                    <WebMapPlaceholder />
                ) : (
                    <>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            region={mapRegion}
                            onRegionChangeComplete={handleRegionChange}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            showsCompass={false}
                            showsScale={false}
                            mapType="standard"
                            onPress={hideCard}
                            // Максимальная плавность
                            pitchEnabled={true}
                            rotateEnabled={true}
                            scrollEnabled={true}
                            zoomEnabled={true}
                            zoomTapEnabled={true}
                            followsUserLocation={false}
                            showsBuildings={true}
                            showsIndoors={false}
                            maxZoomLevel={18}
                            minZoomLevel={8}
                            moveOnMarkerPress={false}
                            // Дополнительная оптимизация
                            loadingEnabled={true}
                            loadingIndicatorColor="#8B1538"
                            loadingBackgroundColor="#FFFFFF"
                        >
                            {/* Маркеры мест */}
                            {nearbyPlaces.map((place, index) => (
                                <Marker
                                    key={place.id}
                                    coordinate={place.coordinate}
                                    onPress={() => handleMarkerPress(place, index)}
                                    anchor={{ x: 0.5, y: 1 }}
                                    centerOffset={{ x: 0, y: -15 }}
                                    tracksViewChanges={false}
                                >
                                    <Animated.View
                                        style={[
                                            styles.markerContainer,
                                            {
                                                transform: [
                                                    {
                                                        scale: markerAnimations[index].interpolate({
                                                            inputRange: [0, 1, 1.4],
                                                            outputRange: [0, 1, 1.4],
                                                            extrapolate: 'clamp',
                                                        })
                                                    },
                                                    {
                                                        translateY: markerAnimations[index].interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [20, 0],
                                                            extrapolate: 'clamp',
                                                        })
                                                    }
                                                ],
                                                opacity: markerAnimations[index].interpolate({
                                                    inputRange: [0, 0.5, 1],
                                                    outputRange: [0, 0.7, 1],
                                                    extrapolate: 'clamp',
                                                }),
                                            }
                                        ]}
                                    >
                                        <Animated.View style={[
                                            styles.marker,
                                            selectedPlace?.id === place.id && styles.markerActive,
                                            {
                                                shadowOpacity: markerAnimations[index].interpolate({
                                                    inputRange: [1, 1.4],
                                                    outputRange: [0.2, 0.4],
                                                    extrapolate: 'clamp',
                                                }),
                                            }
                                        ]}>
                                            <Text style={[
                                                styles.markerEmoji,
                                                selectedPlace?.id === place.id && styles.markerEmojiActive
                                            ]}>
                                                {getCategoryEmoji(place.category)}
                                            </Text>
                                        </Animated.View>
                                        <View style={[
                                            styles.markerTriangle,
                                            selectedPlace?.id === place.id && styles.markerTriangleActive
                                        ]} />
                                    </Animated.View>
                                </Marker>
                            ))}
                        </MapView>

                        {/* Map Controls */}
                        <View style={styles.mapControls}>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={handleLocationPress}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.controlIcon}>📍</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.controlButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.controlIcon}>🔍</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Place Card */}
                {selectedPlace && (
                    <Animated.View
                        style={[
                            styles.placeCard,
                            {
                                transform: [
                                    {
                                        translateY: cardAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [400, 0],
                                            extrapolate: 'clamp',
                                        })
                                    },
                                    {
                                        scale: cardAnimation.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0.8, 0.95, 1],
                                            extrapolate: 'clamp',
                                        })
                                    }
                                ],
                                opacity: cardAnimation.interpolate({
                                    inputRange: [0, 0.3, 1],
                                    outputRange: [0, 0.5, 1],
                                    extrapolate: 'clamp',
                                }),
                            }
                        ]}
                    >
                        <TouchableOpacity style={styles.placeCardContent} activeOpacity={0.98}>
                            <View style={styles.placeCardHeader}>
                                <Animated.View
                                    style={[
                                        styles.placeImagePlaceholder,
                                        {
                                            transform: [{
                                                scale: cardAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.9, 1],
                                                    extrapolate: 'clamp',
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <Text style={styles.placeCardEmoji}>
                                        {getCategoryEmoji(selectedPlace.category)}
                                    </Text>
                                </Animated.View>
                                <View style={styles.placeCardInfo}>
                                    <Text style={styles.placeCardName} numberOfLines={1}>
                                        {selectedPlace.name}
                                    </Text>
                                    <Text style={styles.placeCardCategory}>
                                        {selectedPlace.category}
                                    </Text>
                                    <View style={styles.placeCardDetails}>
                                        <View style={[styles.placeCardRating,
                                        { backgroundColor: getRatingColor(selectedPlace.rating) + '15' }
                                        ]}>
                                            <Text style={[styles.placeCardRatingText,
                                            { color: getRatingColor(selectedPlace.rating) }
                                            ]}>
                                                ★ {selectedPlace.rating.toFixed(1)}
                                            </Text>
                                        </View>
                                        <Text style={styles.placeCardDistance}>
                                            {selectedPlace.distance} • {selectedPlace.price}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={hideCard}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            {/* Bottom Info */}
            <View style={styles.bottomInfo}>
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.infoEmoji}>🗺️</Text>
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>
                            {nearbyPlaces.length} место поблизости
                        </Text>
                        <Text style={styles.infoSubtitle}>
                            {location
                                ? 'Местоположение определено'
                                : errorMsg || 'Определяем местоположение...'
                            }
                        </Text>
                    </View>
                </View>
            </View>

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
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#8B1538',
    },
    locationButton: {
        backgroundColor: '#8B1538',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    locationButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    // Map
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },

    // Web Placeholder
    webPlaceholder: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    webPlaceholderContent: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    webPlaceholderEmoji: {
        fontSize: 64,
        marginBottom: 24,
    },
    webPlaceholderTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 12,
    },
    webPlaceholderSubtitle: {
        fontSize: 16,
        color: '#48484A',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    webDownloadButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    webDownloadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Web Places List
    webPlacesList: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    webPlacesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    webPlaceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    webPlaceEmoji: {
        fontSize: 24,
        marginRight: 16,
    },
    webPlaceInfo: {
        flex: 1,
    },
    webPlaceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    webPlaceDetails: {
        fontSize: 14,
        color: '#48484A',
    },

    mapControls: {
        position: 'absolute',
        right: 16,
        top: 16,
        gap: 8,
    },
    controlButton: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    controlIcon: {
        fontSize: 18,
    },

    // Markers
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        width: 36,
        height: 36,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#8B1538',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    markerActive: {
        backgroundColor: '#8B1538',
    },
    markerEmoji: {
        fontSize: 16,
    },
    markerEmojiActive: {
        color: '#FFFFFF',
    },
    markerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#8B1538',
        marginTop: -1,
    },
    markerTriangleActive: {
        borderTopColor: '#8B1538',
    },

    // Place Card
    placeCard: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    placeCardContent: {
        padding: 16,
    },
    placeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    placeImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    placeCardEmoji: {
        fontSize: 24,
    },
    placeCardInfo: {
        flex: 1,
    },
    placeCardName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    placeCardCategory: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
    },
    placeCardDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    placeCardRating: {
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    placeCardRatingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    placeCardDistance: {
        fontSize: 12,
        color: '#48484A',
        fontWeight: '500',
    },
    closeButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // Bottom Info
    bottomInfo: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
    },
    infoIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoEmoji: {
        fontSize: 18,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
    },
}); 