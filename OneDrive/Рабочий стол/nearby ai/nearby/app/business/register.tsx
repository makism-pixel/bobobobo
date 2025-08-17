import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import TerraceLayoutEditor from '@/components/TerraceLayoutEditor';
import * as ImagePicker from 'expo-image-picker';

interface LayoutData {
    name: string;
    width: number;
    height: number;
    furniture: any[];
    features: string[];
}

interface BusinessProfile {
    // Основная информация
    businessName: string;
    businessType: string;
    description: string;
    features: string[]; // Особенности заведения
    terraceLayouts: LayoutData[]; // Планировки террасы
    hasCustomLayout: boolean; // Есть ли пользовательская планировка

    // Контакты
    email: string;
    phone: string;
    website: string;
    instagram: string;
    facebook: string;

    // Адрес
    address: string;
    city: string;
    postalCode: string;

    // Владелец
    ownerName: string;
    ownerTitle: string;

    // Рабочая информация
    workingHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };

    // Настройки
    acceptsReservations: boolean;
    hasDelivery: boolean;
    acceptsCards: boolean;

    // Верификация
    taxNumber: string;
    registrationNumber: string;

    // Фотографии
    photos: string[];

    // Статус
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
}

const businessTypes = [
    '🍕 Ресторан',
    '☕ Кафе',
    '🍔 Фаст-фуд',
    '🍰 Пекарня',
    '🍷 Бар/Паб',
    '🛍️ Магазин',
    '💇 Салон красоты',
    '🏋️ Фитнес-центр',
    '🏨 Отель',
    '🎬 Развлечения',
    '🏥 Услуги',
    '📚 Образование'
];

const weekDays = [
    { key: 'monday', label: 'Понедельник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Среда' },
    { key: 'thursday', label: 'Четверг' },
    { key: 'friday', label: 'Пятница' },
    { key: 'saturday', label: 'Суббота' },
    { key: 'sunday', label: 'Воскресенье' }
];

export default function BusinessRegisterScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState(''); // Для добавления новой особенности
    const [terraceLayout, setTerraceLayout] = useState<LayoutData | null>(null); // Планировка террасы

    // Предложенные особенности
    const suggestedFeatures = [
        '💳 Принимаем карты',
        '🚗 Парковка',
        '📶 WiFi',
        '🌿 Веганские опции',
        '👶 Детское меню',
        '🍷 Винная карта',
        '🚭 Для некурящих',
        '♿ Доступно для инвалидов',
        '🎵 Живая музыка',
        '🏠 Уютная атмосфера',
        '⚡ Быстрое обслуживание',
        '🍕 Доставка',
        '📐 Интерактивная планировка террасы',
        '🪑 Показ расположения столиков',
        '🏖️ Летняя терраса с чертежом',
        '🎨 Визуализация зала'
    ];

    const [profile, setProfile] = useState<BusinessProfile>({
        businessName: '',
        businessType: businessTypes[0],
        description: '',
        features: [], // Особенности заведения
        terraceLayouts: [], // Планировки террасы
        hasCustomLayout: false, // Есть ли пользовательская планировка

        email: user?.email || '',
        phone: '',
        website: '',
        instagram: '',
        facebook: '',

        address: '',
        city: '',
        postalCode: '',

        ownerName: user?.displayName || '',
        ownerTitle: '',

        workingHours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
        },

        acceptsReservations: false,
        hasDelivery: false,
        acceptsCards: true,

        taxNumber: '',
        registrationNumber: '',

        photos: [],

        isVerified: false,
        verificationStatus: 'pending'
    });

    // Выбор фотографий
    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Ошибка', 'Нужно разрешение для доступа к галерее');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                if (selectedPhotos.length >= 5) {
                    Alert.alert('Ограничение', 'Максимум 5 фотографий');
                    return;
                }
                setSelectedPhotos([...selectedPhotos, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать фотографию');
        }
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Функции для управления особенностями
    const addFeature = (feature: string) => {
        if (!profile.features.includes(feature)) {
            setProfile(prev => ({
                ...prev,
                features: [...prev.features, feature]
            }));
        }
    };

    const removeFeature = (feature: string) => {
        setProfile(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature)
        }));
    };

    const addCustomFeature = () => {
        const trimmedFeature = newFeature.trim();
        if (trimmedFeature && !profile.features.includes(trimmedFeature)) {
            addFeature(trimmedFeature);
            setNewFeature('');
        }
    };

    const handleLayoutChange = (layout: LayoutData | null) => {
        setTerraceLayout(layout);
        if (layout) {
            // Добавляем особенности планировки в общий список
            const layoutFeatures = layout.features || [];
            const existingFeatures = profile.features.filter(f => !f.includes('📐') && !f.includes('🪑') && !f.includes('🍽️'));
            setProfile({
                ...profile,
                features: [...existingFeatures, ...layoutFeatures],
                terraceLayouts: [layout],
                hasCustomLayout: true
            });
        } else {
            // Удаляем особенности планировки
            const featuresWithoutLayout = profile.features.filter(f => !f.includes('📐') && !f.includes('🪑') && !f.includes('🍽️'));
            setProfile({
                ...profile,
                features: featuresWithoutLayout,
                terraceLayouts: [],
                hasCustomLayout: false
            });
        }
    };

    // Загрузка фотографий в Firebase Storage
    const uploadPhotos = async (): Promise<string[]> => {
        const photoUrls: string[] = [];

        try {
            console.log('📸 Starting photo upload...');
            console.log('👤 User:', user?.uid || 'NO USER');
            console.log('📱 Selected photos:', selectedPhotos.length);
            console.log('🔥 Storage config:', storage.app.name, storage.app.options.storageBucket);

            for (let i = 0; i < selectedPhotos.length; i++) {
                const photoUri = selectedPhotos[i];
                console.log(`📤 Processing photo ${i + 1}/${selectedPhotos.length}`);
                console.log('📁 Photo URI:', photoUri);

                try {
                    // Создаем уникальное имя файла
                    const fileName = `${user?.uid || 'anonymous'}_${Date.now()}_${i}.jpg`;
                    console.log('📝 Generated filename:', fileName);

                    const storageRef = ref(storage, `business-photos/${fileName}`);
                    console.log('🎯 Storage path:', storageRef.fullPath);

                    // Получаем blob из URI
                    console.log('🔄 Fetching image blob...');
                    const response = await fetch(photoUri);
                    console.log('📊 Fetch response status:', response.status, response.statusText);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                    }

                    const blob = await response.blob();
                    console.log(`📁 Blob created - Size: ${blob.size} bytes, Type: ${blob.type}`);

                    // Загружаем в Firebase Storage
                    console.log('☁️ Uploading to Firebase Storage...');
                    const snapshot = await uploadBytes(storageRef, blob);
                    console.log('✅ Upload successful:', {
                        name: snapshot.metadata.name,
                        size: snapshot.metadata.size,
                        contentType: snapshot.metadata.contentType,
                        fullPath: snapshot.metadata.fullPath
                    });

                    // Получаем URL для скачивания
                    console.log('🔗 Getting download URL...');
                    const downloadURL = await getDownloadURL(storageRef);
                    console.log('✅ Download URL obtained:', downloadURL.substring(0, 100) + '...');

                    photoUrls.push(downloadURL);
                    console.log(`🎉 Photo ${i + 1} uploaded successfully!`);

                } catch (photoError) {
                    console.error(`❌ Error with photo ${i + 1}:`, {
                        error: photoError,
                        message: (photoError as Error).message,
                        code: (photoError as any).code,
                        stack: (photoError as Error).stack
                    });
                    throw new Error(`Ошибка загрузки фото ${i + 1}: ${(photoError as Error).message}`);
                }
            }

            console.log('🎉 All photos uploaded successfully!', photoUrls.length, 'URLs');
            return photoUrls;
        } catch (error) {
            console.error('❌ Photo upload failed:', {
                error,
                message: (error as Error).message,
                code: (error as any).code,
                details: (error as any).details
            });
            throw error;
        }
    };

    const submitApplication = async () => {
        if (!user) {
            console.error('❌ No user found');
            return;
        }

        console.log('📝 Starting application submission for user:', user.uid, user.email);

        // Валидация
        if (!profile.businessName || !profile.phone || !profile.address) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Фотографии теперь опциональны
        if (selectedPhotos.length === 0) {
            console.log('ℹ️ No photos selected - proceeding without photos');
        }

        // Проверка часов работы
        const hasWorkingHours = Object.values(profile.workingHours).some(day => !day.closed);
        if (!hasWorkingHours) {
            Alert.alert('Ошибка', 'Укажите хотя бы один рабочий день');
            return;
        }

        setLoading(true);
        try {
            let photoUrls: string[] = [];

            if (selectedPhotos.length > 0) {
                console.log('📸 Uploading photos...', selectedPhotos.length, 'photos');
                photoUrls = await uploadPhotos();
                console.log('✅ Photos uploaded successfully');
            } else {
                console.log('📝 Proceeding without photos');
            }

            console.log('💾 Saving business profile...');

            // Создаем уникальный ID для заявки (не привязанный к user.uid)
            const uniqueApplicationId = `${user.uid}_${Date.now()}`;
            const businessDocRef = doc(db, 'businessProfiles', uniqueApplicationId);
            const businessData = {
                ...profile,
                photos: photoUrls,
                userId: user.uid,
                userEmail: user.email,
                applicationId: uniqueApplicationId, // Добавляем ID заявки
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(businessDocRef, businessData);
            console.log('✅ Business profile saved successfully');

            // Обновляем роль пользователя
            const userDocRef = doc(db, 'users', user.uid);
            const userData = {
                role: 'business',
                businessId: uniqueApplicationId, // Используем ID заявки, а не user.uid
                email: user.email,
                displayName: user.displayName,
                updatedAt: new Date()
            };

            await setDoc(userDocRef, userData, { merge: true });
            console.log('✅ User role updated successfully');

            Alert.alert(
                '🎉 Заявка отправлена!',
                'Ваша заявка на регистрацию бизнеса отправлена на модерацию. Мы свяжемся с вами в течение 24 часов.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)')
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Application submission failed:', error);

            let errorMessage = 'Произошла неизвестная ошибка';

            if (error instanceof Error) {
                if (error.message.includes('Firebase Storage')) {
                    errorMessage = 'Ошибка загрузки фотографий. Проверьте интернет-соединение или попробуйте другие фото.';
                } else if (error.message.includes('permission-denied')) {
                    errorMessage = 'Нет прав доступа. Обратитесь к администратору.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Проблема с интернет-соединением. Попробуйте еще раз.';
                } else {
                    errorMessage = error.message;
                }
            }

            Alert.alert(
                'Ошибка отправки заявки',
                errorMessage + '\n\nПопробуйте еще раз или обратитесь в поддержку.',
                [
                    { text: 'Попробовать снова', style: 'default' },
                    { text: 'Отмена', style: 'cancel' }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Основная информация</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Название заведения *</Text>
                <TextInput
                    style={styles.input}
                    value={profile.businessName}
                    onChangeText={(text) => setProfile({ ...profile, businessName: text })}
                    placeholder="Например: Café Mozart"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Имя владельца *</Text>
                <TextInput
                    style={styles.input}
                    value={profile.ownerName}
                    onChangeText={(text) => setProfile({ ...profile, ownerName: text })}
                    placeholder="Ваше полное имя"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Должность</Text>
                <TextInput
                    style={styles.input}
                    value={profile.ownerTitle}
                    onChangeText={(text) => setProfile({ ...profile, ownerTitle: text })}
                    placeholder="Например: Владелец, Менеджер"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Тип заведения *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                    {businessTypes.map((type, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.typeCard,
                                profile.businessType === type && styles.selectedTypeCard
                            ]}
                            onPress={() => setProfile({ ...profile, businessType: type })}
                        >
                            <Text style={[
                                styles.typeText,
                                profile.businessType === type && styles.selectedTypeText
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Описание заведения</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.description}
                    onChangeText={(text) => setProfile({ ...profile, description: text })}
                    placeholder="Расскажите о вашем заведении..."
                    placeholderTextColor="#8E8E93"
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Особенности заведения */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Особенности заведения</Text>
                <Text style={styles.subtitle}>Выберите особенности, которые выделяют ваше заведение</Text>

                {/* Выбранные особенности */}
                {profile.features.length > 0 && (
                    <View style={styles.selectedFeatures}>
                        <Text style={styles.selectedFeaturesTitle}>Выбранные особенности:</Text>
                        <View style={styles.selectedFeaturesContainer}>
                            {profile.features.map((feature, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.selectedFeatureTag}
                                    onPress={() => removeFeature(feature)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.selectedFeatureTagText}>{feature}</Text>
                                    <Text style={styles.removeFeatureTagText}>×</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Предложенные особенности */}
                <View style={styles.featuresGrid}>
                    {suggestedFeatures.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.featureChip,
                                profile.features.includes(feature) && styles.selectedFeatureChip
                            ]}
                            onPress={() => profile.features.includes(feature) ? removeFeature(feature) : addFeature(feature)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.featureText,
                                profile.features.includes(feature) && styles.selectedFeatureText
                            ]}>
                                {feature}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Добавить собственную особенность */}
                <View style={styles.customFeatureContainer}>
                    <TextInput
                        style={styles.customFeatureInput}
                        value={newFeature}
                        onChangeText={setNewFeature}
                        placeholder="Добавить свою особенность..."
                        placeholderTextColor="#8E8E93"
                        onSubmitEditing={addCustomFeature}
                    />
                    <TouchableOpacity
                        style={styles.addFeatureButton}
                        onPress={addCustomFeature}
                        disabled={!newFeature.trim()}
                    >
                        <Text style={styles.addFeatureButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Планировка террасы */}
            <TerraceLayoutEditor
                onLayoutChange={handleLayoutChange}
                initialLayout={terraceLayout}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Контактная информация</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Телефон *</Text>
                <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => setProfile({ ...profile, phone: text })}
                    placeholder="+371 XX XXX XXX"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Веб-сайт</Text>
                <TextInput
                    style={styles.input}
                    value={profile.website}
                    onChangeText={(text) => setProfile({ ...profile, website: text })}
                    placeholder="https://example.com"
                    placeholderTextColor="#8E8E93"
                    keyboardType="url"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram</Text>
                <TextInput
                    style={styles.input}
                    value={profile.instagram}
                    onChangeText={(text) => setProfile({ ...profile, instagram: text })}
                    placeholder="@your_instagram"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Facebook</Text>
                <TextInput
                    style={styles.input}
                    value={profile.facebook}
                    onChangeText={(text) => setProfile({ ...profile, facebook: text })}
                    placeholder="facebook.com/yourpage"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Адрес *</Text>
                <TextInput
                    style={styles.input}
                    value={profile.address}
                    onChangeText={(text) => setProfile({ ...profile, address: text })}
                    placeholder="Elizabetes iela 83/85"
                    placeholderTextColor="#8E8E93"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Город</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.city}
                        onChangeText={(text) => setProfile({ ...profile, city: text })}
                        placeholder="Рига"
                        placeholderTextColor="#8E8E93"
                    />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Почтовый код</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.postalCode}
                        onChangeText={(text) => setProfile({ ...profile, postalCode: text })}
                        placeholder="LV-1010"
                        placeholderTextColor="#8E8E93"
                    />
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Часы работы *</Text>

            {weekDays.map((day) => (
                <View key={day.key} style={styles.workingHoursRow}>
                    <View style={styles.dayInfo}>
                        <Text style={styles.dayLabel}>{day.label}</Text>
                        <Switch
                            value={!profile.workingHours[day.key as keyof typeof profile.workingHours].closed}
                            onValueChange={(value) => {
                                setProfile({
                                    ...profile,
                                    workingHours: {
                                        ...profile.workingHours,
                                        [day.key]: {
                                            ...profile.workingHours[day.key as keyof typeof profile.workingHours],
                                            closed: !value
                                        }
                                    }
                                });
                            }}
                            trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>

                    {!profile.workingHours[day.key as keyof typeof profile.workingHours].closed && (
                        <View style={styles.timeInputs}>
                            <TextInput
                                style={styles.timeInput}
                                value={profile.workingHours[day.key as keyof typeof profile.workingHours].open}
                                onChangeText={(text) => {
                                    setProfile({
                                        ...profile,
                                        workingHours: {
                                            ...profile.workingHours,
                                            [day.key]: {
                                                ...profile.workingHours[day.key as keyof typeof profile.workingHours],
                                                open: text
                                            }
                                        }
                                    });
                                }}
                                placeholder="09:00"
                                placeholderTextColor="#8E8E93"
                            />
                            <Text style={styles.timeSeparator}>—</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={profile.workingHours[day.key as keyof typeof profile.workingHours].close}
                                onChangeText={(text) => {
                                    setProfile({
                                        ...profile,
                                        workingHours: {
                                            ...profile.workingHours,
                                            [day.key]: {
                                                ...profile.workingHours[day.key as keyof typeof profile.workingHours],
                                                close: text
                                            }
                                        }
                                    });
                                }}
                                placeholder="18:00"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>
                    )}
                </View>
            ))}
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Фотографии (опционально)</Text>
            <Text style={styles.subtitle}>Добавьте до 5 фотографий вашего заведения (можно пропустить)</Text>

            {/* Выбранные фотографии */}
            <ScrollView horizontal style={styles.photosScroll} showsHorizontalScrollIndicator={false}>
                {selectedPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                        <Image source={{ uri: photo }} style={styles.photoPreview} />
                        <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => removePhoto(index)}
                        >
                            <Text style={styles.removePhotoText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {selectedPhotos.length < 5 && (
                    <TouchableOpacity style={styles.addPhotoButton} onPress={pickImages}>
                        <Text style={styles.addPhotoIcon}>+</Text>
                        <Text style={styles.addPhotoText}>Добавить фото</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {selectedPhotos.length === 0 && (
                <View style={styles.noPhotosContainer}>
                    <Text style={styles.noPhotosIcon}>📸</Text>
                    <Text style={styles.noPhotosText}>Фотографии не добавлены</Text>
                    <Text style={[styles.noPhotosText, { fontSize: 14, opacity: 0.7 }]}>Этот шаг можно пропустить</Text>
                    <TouchableOpacity style={styles.primaryAddButton} onPress={pickImages}>
                        <Text style={styles.primaryAddButtonText}>Добавить фотографию</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderStep5 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Дополнительные услуги</Text>

            <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                    <Text style={styles.switchTitle}>🪑 Принимаем бронирования</Text>
                    <Text style={styles.switchSubtitle}>Клиенты смогут забронировать столик</Text>
                </View>
                <Switch
                    value={profile.acceptsReservations}
                    onValueChange={(value) => setProfile({ ...profile, acceptsReservations: value })}
                    trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                    thumbColor={'#FFFFFF'}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                    <Text style={styles.switchTitle}>🚚 Доставка</Text>
                    <Text style={styles.switchSubtitle}>Предоставляем услуги доставки</Text>
                </View>
                <Switch
                    value={profile.hasDelivery}
                    onValueChange={(value) => setProfile({ ...profile, hasDelivery: value })}
                    trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                    thumbColor={'#FFFFFF'}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                    <Text style={styles.switchTitle}>💳 Оплата картой</Text>
                    <Text style={styles.switchSubtitle}>Принимаем банковские карты</Text>
                </View>
                <Switch
                    value={profile.acceptsCards}
                    onValueChange={(value) => setProfile({ ...profile, acceptsCards: value })}
                    trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                    thumbColor={'#FFFFFF'}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Регистрационный номер компании</Text>
                <TextInput
                    style={styles.input}
                    value={profile.registrationNumber}
                    onChangeText={(text) => setProfile({ ...profile, registrationNumber: text })}
                    placeholder="40003XXXXXX"
                    placeholderTextColor="#8E8E93"
                />
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Регистрация бизнеса</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Шаг {step} из 5</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Процесс верификации</Text>
                        <Text style={styles.infoText}>
                            После подачи заявки наша команда проверит информацию в течение 24 часов.
                            Вы получите уведомление о статусе заявки.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.bottomContainer}>
                <View style={styles.buttonRow}>
                    {step > 1 && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => setStep(step - 1)}
                        >
                            <Text style={styles.secondaryButtonText}>Назад</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
                        onPress={step === 5 ? submitApplication : () => setStep(step + 1)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {step === 5 ? 'Отправить заявку' : 'Далее'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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

    // Progress
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    progressText: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
        textAlign: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8B1538',
        borderRadius: 2,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    stepContainer: {
        paddingVertical: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
    },

    // Form
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1D1D1F',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },

    // Type Selection
    typeScroll: {
        marginTop: 8,
    },
    typeChip: {
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTypeChip: {
        backgroundColor: '#8B1538',
        borderColor: '#8B1538',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1D1D1F',
    },
    selectedTypeText: {
        color: '#FFFFFF',
    },

    // Working Hours
    workingHoursRow: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    dayInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    timeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1D1D1F',
        textAlign: 'center',
        minWidth: 80,
    },
    timeSeparator: {
        fontSize: 18,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // Photos
    photosScroll: {
        marginTop: 16,
        marginBottom: 20,
    },
    photoContainer: {
        position: 'relative',
        marginRight: 12,
    },
    photoPreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF3B30',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removePhotoText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    addPhotoButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        borderWidth: 2,
        borderColor: '#8B1538',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoIcon: {
        fontSize: 32,
        color: '#8B1538',
        marginBottom: 4,
    },
    addPhotoText: {
        fontSize: 12,
        color: '#8B1538',
        fontWeight: '600',
        textAlign: 'center',
    },
    noPhotosContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noPhotosIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    noPhotosText: {
        fontSize: 18,
        color: '#8E8E93',
        marginBottom: 20,
    },
    primaryAddButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    primaryAddButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Switches
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    switchSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginVertical: 20,
    },
    infoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },

    // Bottom Buttons
    bottomContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#8B1538',
    },
    secondaryButton: {
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButtonText: {
        color: '#8B1538',
        fontSize: 16,
        fontWeight: '600',
    },

    // New styles for Step 1
    typeSelector: {
        marginTop: 8,
    },
    typeCard: {
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTypeCard: {
        backgroundColor: '#8B1538',
        borderColor: '#8B1538',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    featureChip: {
        backgroundColor: '#F2F2F7',
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedFeatureChip: {
        backgroundColor: '#8B1538',
        borderColor: '#8B1538',
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        textAlign: 'center',
    },
    selectedFeatureText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    removeFeatureText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    customFeatureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    customFeatureInput: {
        flex: 1,
        fontSize: 16,
        color: '#1D1D1F',
        paddingVertical: 0,
    },
    addFeatureButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#8B1538',
        borderRadius: 20,
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addFeatureButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    selectedFeatures: {
        marginBottom: 20,
    },
    selectedFeaturesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    selectedFeaturesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectedFeatureTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B1538',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedFeatureTagText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
    },
    removeFeatureTagText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        width: 20,
        height: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
}); 