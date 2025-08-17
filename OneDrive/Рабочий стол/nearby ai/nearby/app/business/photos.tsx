import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { cleanupTestPhotos, cleanupBusinessPhotos } from '@/utils/cleanupTestPhotos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function BusinessPhotosScreen() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Запрос разрешений при монтировании
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Необходим доступ к галерее',
                    'Пожалуйста, разрешите доступ к галерее в настройках устройства.'
                );
            }
        })();
    }, []);

    // Загрузка фото в локальное хранилище
    const savePhotoToLocal = async (uri: string): Promise<string> => {
        try {
            if (!user?.uid) {
                throw new Error('User not authenticated');
            }

            // Создаем директорию для фотографий пользователя, если её нет
            const photosDir = `${FileSystem.documentDirectory}photos/${user.uid}`;
            const photosDirInfo = await FileSystem.getInfoAsync(photosDir);

            if (!photosDirInfo.exists) {
                await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
            }

            // Получаем информацию о файле
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists && fileInfo.size > 5 * 1024 * 1024) {
                throw new Error('Файл слишком большой (максимум 5MB)');
            }

            // Копируем файл в нашу директорию
            const filename = `photo_${Date.now()}.jpg`;
            const newUri = `${photosDir}/${filename}`;
            await FileSystem.copyAsync({
                from: uri,
                to: newUri
            });

            return newUri;
        } catch (error) {
            console.error('Error saving photo:', error);
            if (error instanceof Error) {
                throw new Error(`Ошибка сохранения фото: ${error.message}`);
            }
            throw new Error('Неизвестная ошибка при сохранении фото');
        }
    };

    // Сохранение информации о фото в локальное хранилище
    const savePhotoMetadata = async (uri: string, isMain: boolean = false) => {
        if (!user?.uid) return;

        try {
            // Получаем текущие метаданные
            const photosMetadataString = await AsyncStorage.getItem(`@photos_${user.uid}`);
            const photosMetadata = photosMetadataString ? JSON.parse(photosMetadataString) : [];

            // Добавляем новое фото
            const newPhotoMetadata = {
                uri,
                isMain,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Если это главное фото, убираем флаг isMain у других фото
            if (isMain) {
                photosMetadata.forEach((photo: any) => {
                    photo.isMain = false;
                });
            }

            photosMetadata.push(newPhotoMetadata);

            // Сохраняем обновленные метаданные
            await AsyncStorage.setItem(`@photos_${user.uid}`, JSON.stringify(photosMetadata));
        } catch (error) {
            console.error('Error saving photo metadata:', error);
            throw new Error('Не удалось сохранить информацию о фото');
        }
    };

    // Загрузка сохраненных фото при монтировании
    useEffect(() => {
        const loadSavedPhotos = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                const photosMetadataString = await AsyncStorage.getItem(`@photos_${user.uid}`);
                if (photosMetadataString) {
                    const photosMetadata = JSON.parse(photosMetadataString);
                    const photoUris = photosMetadata.map((photo: any) => photo.uri);
                    setPhotos(photoUris);
                }
            } catch (error) {
                console.error('Error loading saved photos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSavedPhotos();
    }, [user]);

    // Выбор фото из галереи
    const pickImage = async () => {
        if (!user?.uid) {
            Alert.alert('Ошибка', 'Необходимо авторизоваться');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.8,
                aspect: [16, 9]
            });

            if (!result.canceled && result.assets[0]) {
                setUploading(true);
                try {
                    const savedUri = await savePhotoToLocal(result.assets[0].uri);
                    await savePhotoMetadata(savedUri, photos.length === 0);
                    setPhotos([...photos, savedUri]);
                    Alert.alert('Успешно', 'Фото успешно сохранено');
                } catch (saveError) {
                    if (saveError instanceof Error) {
                        Alert.alert('Ошибка сохранения', saveError.message);
                    } else {
                        Alert.alert('Ошибка', 'Не удалось сохранить фото');
                    }
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать фото');
        } finally {
            setUploading(false);
        }
    };

    // Съемка фото на камеру
    const takePhoto = async () => {
        if (!user?.uid) {
            Alert.alert('Ошибка', 'Необходимо авторизоваться');
            return;
        }

        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Необходим доступ к камере',
                    'Пожалуйста, разрешите доступ к камере в настройках устройства.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
                aspect: [16, 9]
            });

            if (!result.canceled && result.assets[0]) {
                setUploading(true);
                try {
                    const savedUri = await savePhotoToLocal(result.assets[0].uri);
                    await savePhotoMetadata(savedUri, photos.length === 0);
                    setPhotos([...photos, savedUri]);
                    Alert.alert('Успешно', 'Фото успешно сохранено');
                } catch (saveError) {
                    if (saveError instanceof Error) {
                        Alert.alert('Ошибка сохранения', saveError.message);
                    } else {
                        Alert.alert('Ошибка', 'Не удалось сохранить фото');
                    }
                }
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Ошибка', 'Не удалось сделать фото');
        } finally {
            setUploading(false);
        }
    };

    const addPhoto = () => {
        if (photos.length >= 10) {
            Alert.alert('Лимит фотографий', 'Достигнут максимальный лимит фотографий (10)');
            return;
        }

        Alert.alert(
            'Добавить фото',
            'Выберите источник фотографии',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: '📷 Камера', onPress: takePhoto },
                { text: '📱 Галерея', onPress: pickImage }
            ]
        );
    };

    const removePhoto = async (index: number) => {
        if (!user?.uid) return;

        Alert.alert(
            'Удалить фото?',
            'Это действие нельзя отменить',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Удаляем файл
                            const photoUri = photos[index];
                            await FileSystem.deleteAsync(photoUri, { idempotent: true });

                            // Обновляем метаданные
                            const photosMetadataString = await AsyncStorage.getItem(`@photos_${user.uid}`);
                            if (photosMetadataString) {
                                const photosMetadata = JSON.parse(photosMetadataString);
                                photosMetadata.splice(index, 1);
                                await AsyncStorage.setItem(`@photos_${user.uid}`, JSON.stringify(photosMetadata));
                            }

                            // Обновляем состояние
                            const newPhotos = photos.filter((_, i) => i !== index);
                            setPhotos(newPhotos);
                        } catch (error) {
                            console.error('Error removing photo:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить фото');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Фотографии</Text>
                <TouchableOpacity onPress={addPhoto}>
                    <Text style={styles.addButton}>+ Добавить</Text>
                </TouchableOpacity>
            </View>

            {uploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Загрузка фото...</Text>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Photo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Главное фото</Text>
                    <Text style={styles.sectionSubtitle}>
                        Это фото будет отображаться первым в результатах поиска
                    </Text>

                    {photos.length > 0 ? (
                        <View style={styles.mainPhotoContainer}>
                            <Image
                                source={{ uri: photos[0] }}
                                style={styles.mainPhoto}
                                resizeMode="cover"
                            />
                            <View style={styles.mainPhotoBadge}>
                                <Text style={styles.mainPhotoBadgeText}>Главное фото</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.photoRemoveButton}
                                onPress={() => removePhoto(0)}
                            >
                                <Text style={styles.photoRemoveText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addMainPhoto} onPress={addPhoto}>
                            <Text style={styles.addMainPhotoIcon}>📷</Text>
                            <Text style={styles.addMainPhotoText}>Добавить главное фото</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Gallery */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Галерея ({photos.length - 1}/10)</Text>
                    <Text style={styles.sectionSubtitle}>
                        Добавьте до 10 фотографий вашего заведения
                    </Text>

                    <View style={styles.photosGrid}>
                        {photos.slice(1).map((photo, index) => (
                            <View key={index + 1} style={styles.photoContainer}>
                                <Image
                                    source={{ uri: photo }}
                                    style={styles.galleryPhoto}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.photoRemoveButton}
                                    onPress={() => removePhoto(index + 1)}
                                >
                                    <Text style={styles.photoRemoveText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {photos.length < 11 && (
                            <TouchableOpacity style={styles.addPhotoSlot} onPress={addPhoto}>
                                <Text style={styles.addPhotoIcon}>+</Text>
                                <Text style={styles.addPhotoText}>Добавить</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.section}>
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsIcon}>💡</Text>
                        <View style={styles.tipsContent}>
                            <Text style={styles.tipsTitle}>Советы для отличных фото</Text>
                            <Text style={styles.tipsText}>
                                • Используйте хорошее освещение{'\n'}
                                • Фотографируйте интерьер и блюда{'\n'}
                                • Показывайте атмосферу заведения{'\n'}
                                • Обновляйте фото регулярно
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Photo Requirements */}
                <View style={styles.section}>
                    <View style={styles.requirementsCard}>
                        <Text style={styles.requirementsTitle}>Требования к фотографиям</Text>
                        <Text style={styles.requirementsText}>
                            • Минимальный размер: 800x600 пикселей{'\n'}
                            • Максимальный размер файла: 5 МБ{'\n'}
                            • Форматы: JPG, PNG{'\n'}
                            • Фото должны быть четкими и качественными
                        </Text>
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
    addButton: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Sections
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 16,
    },

    // Main Photo
    mainPhotoContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    mainPhoto: {
        width: '100%',
        height: 200,
    },
    mainPhotoBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#8B1538',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    mainPhotoBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    addMainPhoto: {
        height: 200,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addMainPhotoIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    addMainPhotoText: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // Gallery
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoContainer: {
        position: 'relative',
        width: (width - 72) / 3,
        height: (width - 72) / 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    galleryPhoto: {
        width: '100%',
        height: '100%',
    },
    photoRemoveButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoRemoveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    addPhotoSlot: {
        width: (width - 72) / 3,
        height: (width - 72) / 3,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addPhotoIcon: {
        fontSize: 24,
        color: '#8E8E93',
        marginBottom: 4,
    },
    addPhotoText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },

    // Tips
    tipsCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BAE6FD',
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
        color: '#0369A1',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 14,
        color: '#0F4C81',
        lineHeight: 20,
    },

    // Requirements
    requirementsCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D97706',
        marginBottom: 8,
    },
    requirementsText: {
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },

    // Loading
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#1D1D1F',
        fontWeight: '500',
    },
});