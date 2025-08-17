import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import PlaceCard from '@/components/PlaceCard';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function FavoritesScreen() {
    const { favorites, isLoading, isFavorite, toggleFavorite } = useFavorites();

    const renderPlaceCard = ({ item }: { item: any }) => (
        <PlaceCard
            name={item.businessName}
            category={item.businessType}
            rating={item.rating || 4.5}
            distance="150м"
            price="€€"
            address={`${item.address}, ${item.city}`}
            phone={item.phone}
            hours="9:00 - 22:00"
            description={item.description}
            isFavorite={isFavorite(item.id)}
            onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.id } })}
            onFavoritePress={() => toggleFavorite(item)}
        />
    );

    const handleExplorePress = () => {
        router.push('/(tabs)');
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Избранное</Text>
                    <Text style={styles.subtitle}>Ваши любимые места и заведения</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Загружаем избранные места...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Избранное</Text>
                <Text style={styles.subtitle}>Ваши любимые места и заведения</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {favorites.length === 0 ? (
                    // Empty State
                    <>
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={styles.emptyEmoji}>❤️</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Пока нет избранных мест</Text>
                            <Text style={styles.emptySubtitle}>
                                Найдите интересные места через поиск и добавьте их в избранное, нажав на ❤️
                            </Text>
                            <TouchableOpacity style={styles.exploreButton} onPress={handleExplorePress}>
                                <Text style={styles.exploreButtonText}>Исследовать места</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Features Preview */}
                        <View style={styles.featuresSection}>
                            <Text style={styles.sectionTitle}>Скоро доступно</Text>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureEmoji}>📂</Text>
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Категории</Text>
                                    <Text style={styles.featureSubtitle}>Сортировка по типам мест</Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureEmoji}>🔄</Text>
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Синхронизация</Text>
                                    <Text style={styles.featureSubtitle}>Доступ с любого устройства</Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureEmoji}>📤</Text>
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Поделиться</Text>
                                    <Text style={styles.featureSubtitle}>Отправка списков друзьям</Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    // Favorites List
                    <View style={styles.favoritesGrid}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Мои избранные ({favorites.length})</Text>
                            <TouchableOpacity>
                                <Text style={styles.editText}>Изменить</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={favorites}
                            renderItem={renderPlaceCard}
                            keyExtractor={(item) => item.id}
                            numColumns={1}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
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
        paddingBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#8B1538',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#48484A',
        lineHeight: 22,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#FFF7ED',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyEmoji: {
        fontSize: 32,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 32,
        marginBottom: 32,
    },
    exploreButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    exploreButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Favorites Grid
    favoritesGrid: {
        flex: 1,
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    editText: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 6,
    },

    // Features
    featuresSection: {
        marginTop: 40,
        marginBottom: 32,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    featureIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureEmoji: {
        fontSize: 20,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    featureSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
    },
}); 