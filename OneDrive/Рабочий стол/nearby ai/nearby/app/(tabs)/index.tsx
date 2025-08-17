import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, Text, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { supabase } from '@/config/supabase';
import PlaceCard from '@/components/PlaceCard';
import { ApprovedBusiness } from '@/types';
import { debugApprovedPlaces } from '@/utils/debugApprovedPlaces';
import '@/utils/testFirebaseStorage';
import '@/utils/storageDebug';

// Импорт тестовых функций для разработки
import '@/utils/testApplication';
// Отладочные импорты (можно удалить в продакшене)
// import { runSupabaseDebug, debugSpecificBusiness } from '@/utils/supabaseDebug';
// import { runPhotoTests, uploadTestPhotoToExistingBusiness } from '@/utils/testPhotoUpload';
// import { testImageUrl } from '@/utils/testImageUrl';


export default function HomeScreen() {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedBusinesses, setApprovedBusinesses] = useState<ApprovedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const quickSearches = [
    { emoji: '🍕', text: 'Пицца' },
    { emoji: '☕', text: 'Кофе' },
    { emoji: '🍽️', text: 'Ресторан' },
    { emoji: '🎬', text: 'Кино' },
    { emoji: '⛽', text: 'Заправка' },
    { emoji: '🛍️', text: 'Шопинг' }
  ];



  // Загружаем фото для бизнеса из Supabase
  const loadBusinessPhoto = async (businessId: string): Promise<string | undefined> => {
    try {
      // Нормализуем возможные варианты идентификатора
      const possibleIds = Array.from(
        new Set([
          businessId,
          businessId.split('_')[0],
          businessId.replace(/_\d+$/, ''),
        ])
      );

      // 1) Пытаемся взять главное фото среди всех вариантов ID
      const { data: mainPhoto, error: mainErr } = await supabase
        .from('photos')
        .select('url')
        .in('firebase_business_id', possibleIds)
        .eq('is_main', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mainErr && mainPhoto?.url) {
        return mainPhoto.url as string;
      }

      // 2) Если главного нет — берем самое свежее фото
      const { data: latestPhoto, error: latestErr } = await supabase
        .from('photos')
        .select('url')
        .in('firebase_business_id', possibleIds)
        .order('is_main', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestErr && latestPhoto?.url) {
        return latestPhoto.url as string;
      }

      return undefined;
    } catch (error) {
      console.error('❌ Error loading business photo:', error);
      return undefined;
    }
  };

  // Загружаем одобренные заведения
  useEffect(() => {
    console.log('🏠 Loading approved places (public access)...');

    // Запускаем отладку Supabase для проверки фотографий (отключено для чистоты логов)
    // runSupabaseDebug();

    // Запускаем тестирование функций фотографий (отключено для чистоты логов)
    // runPhotoTests();

    const q = query(collection(db, 'approvedPlaces'));

    const unsubscribe = onSnapshot(q,
      async (snapshot) => {
        console.log('📄 Approved places loaded:', snapshot.size);

        const businessesPromises = snapshot.docs.map(async doc => {
          const data = doc.data();

          // Загружаем фото для каждого бизнеса
          const mainPhotoUri = await loadBusinessPhoto(doc.id);

          return {
            id: doc.id,
            businessName: data.businessName,
            businessType: data.businessType,
            description: data.description,
            phone: data.phone,
            address: data.address,
            city: data.city,
            rating: data.rating || 0,
            mainPhotoUri,
            hasDelivery: data.hasDelivery || false,
            acceptsReservations: data.acceptsReservations || false
          };
        });

        const businesses = await Promise.all(businessesPromises);
        setApprovedBusinesses(businesses);
        setLoading(false);
        console.log('✅ Approved places loaded for all users:', businesses.length, 'places');

        // Отладка для первого бизнеса (отключено для чистоты логов)
        // if (businesses.length > 0) {
        //   const firstBusiness = businesses[0];
        //   console.log('🔍 Debugging first business:', firstBusiness.id);
        //   await debugSpecificBusiness(firstBusiness.id);
        //   
        //   // Загружаем тестовую фотографию, если её нет
        //   if (!firstBusiness.mainPhotoUri) {
        //     console.log('🧪 No photo found, uploading test photo...');
        //     const uploadResult = await uploadTestPhotoToExistingBusiness(firstBusiness.id);
        //     
        //     if (uploadResult) {
        //       console.log('🔄 Test photo uploaded, reloading businesses...');
        //     }
        //   }
        // }
      },
      (error) => {
        console.error('❌ Error loading approved places:', error);
        setLoading(false);

        // Если ошибка авторизации, показываем понятное сообщение
        if (error.code === 'permission-denied') {
          console.log('ℹ️ Permission denied - check Firebase rules for public access');
        }
      }
    );

    return () => unsubscribe();
  }, []); // Убираем зависимость от пользователя - загружаем всегда

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredBusinesses = approvedBusinesses.filter((business) =>
    business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlaceCard = ({ item }: { item: ApprovedBusiness }) => {
    return (
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
        mainPhotoUri={item.mainPhotoUri}
        hasDelivery={item.hasDelivery}
        acceptsReservations={item.acceptsReservations}
        onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.id } })}
        onFavoritePress={() => toggleFavorite(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Clean Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Добро пожаловать!</Text>
          <Text style={styles.appTitle}>Nearby AI</Text>
          <Text style={styles.subtitle}>
            {user ?
              `Привет, ${user.displayName || 'друг'}! Найдите идеальные места рядом с вами` :
              'Найдите идеальные места рядом с вами'
            }
          </Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Куда хотите пойти?</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Например: 'уютное кафе рядом' или 'ужин до 20€'"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              multiline={false}
            />
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
              <Text style={styles.searchButtonText}>Поиск</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {quickSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.filterChip, searchQuery === item.text && styles.filterChipActive]}
                onPress={() => handleQuickSearch(item.text)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterEmoji}>{item.emoji}</Text>
                <Text style={[styles.filterText, searchQuery === item.text && styles.filterTextActive]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Context Info */}
        <View style={styles.contextSection}>
          <View style={styles.contextCard}>
            <View style={styles.contextIcon}>
              <Text style={styles.contextEmoji}>☀️</Text>
            </View>
            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>Отличная погода сегодня</Text>
              <Text style={styles.contextSubtitle}>Идеально для кафе на открытом воздухе</Text>
            </View>
          </View>
        </View>

        {/* Places Grid */}
        <View style={styles.placesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Место поблизости</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.placesGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Загружаем места...</Text>
              </View>
            ) : filteredBusinesses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyTitle}>Пока нет одобренных заведений</Text>
                <Text style={styles.emptySubtitle}>
                  Заведения появятся здесь после одобрения заявок администратором
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredBusinesses}
                renderItem={renderPlaceCard}
                keyExtractor={(item) => item.id}
                numColumns={1}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  appTitle: {
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

  // Search
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1D1D1F',
  },
  searchButton: {
    backgroundColor: '#8B1538',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Filters
  filtersSection: {
    marginBottom: 32,
  },
  filtersScroll: {
    paddingLeft: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#8B1538',
    borderColor: '#8B1538',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#48484A',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Context
  contextSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  contextIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contextEmoji: {
    fontSize: 24,
  },
  contextContent: {
    flex: 1,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  contextSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Places Grid
  placesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 16,
    color: '#8B1538',
    fontWeight: '600',
  },
  placesGrid: {
    flex: 1,
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
