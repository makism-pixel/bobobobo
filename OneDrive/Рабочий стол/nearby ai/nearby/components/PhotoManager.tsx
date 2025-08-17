import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import {
    PhotoMetadata,
    uploadPhoto,
    deletePhoto,
    getBusinessPhotos,
    setMainPhoto
} from '@/utils/photoUtils';

interface PhotoManagerProps {
    businessId: string;
    maxPhotos?: number;
    onPhotosChange?: (photos: PhotoMetadata[]) => void;
}

export default function PhotoManager({ businessId, maxPhotos = 10, onPhotosChange }: PhotoManagerProps) {
    const { user } = useAuth();
    const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Загрузка фотографий при монтировании
    useEffect(() => {
        if (businessId) {
            loadPhotos();
        }
    }, [businessId]);

    const loadPhotos = async () => {
        try {
            const loadedPhotos = await getBusinessPhotos(businessId);
            setPhotos(loadedPhotos);
            onPhotosChange?.(loadedPhotos);
        } catch (error) {
            console.error('Error loading photos:', error);
            Alert.alert('Ошибка', 'Не удалось загрузить фотографии');
        } finally {
            setInitializing(false);
        }
    };

    const handleAddPhoto = async (useCamera: boolean = false) => {
        if (!user) {
            Alert.alert('Ошибка', 'Необходимо авторизоваться');
            return;
        }

        if (!businessId) {
            Alert.alert('Ошибка', 'ID бизнеса не найден');
            return;
        }

        if (photos.length >= maxPhotos) {
            Alert.alert('Лимит фотографий', `Достигнут максимальный лимит фотографий (${maxPhotos})`);
            return;
        }

        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Ошибка', 'Необходим доступ к камере');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    quality: 1,
                    aspect: [16, 9]
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Ошибка', 'Необходим доступ к галерее');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    quality: 1,
                    aspect: [16, 9]
                });
            }

            if (!result.canceled && result.assets[0]) {
                setLoading(true);
                try {
                    const isFirstPhoto = photos.length === 0;
                    const newPhoto = await uploadPhoto(businessId, result.assets[0].uri, isFirstPhoto);
                    await loadPhotos(); // Reload photos after upload
                    Alert.alert('Успешно', 'Фото добавлено');
                } catch (error) {
                    console.error('Error uploading photo:', error);
                    if (error instanceof Error) {
                        Alert.alert('Ошибка', `Не удалось загрузить фото: ${error.message}`);
                    } else {
                        Alert.alert('Ошибка', 'Не удалось загрузить фото');
                    }
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать фото');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async (photo: PhotoMetadata) => {
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
                            setLoading(true);
                            await deletePhoto(photo.id);
                            const updatedPhotos = photos.filter(p => p.id !== photo.id);
                            setPhotos(updatedPhotos);
                            onPhotosChange?.(updatedPhotos);

                            // Если удалили главное фото и есть другие фото, делаем первое главным
                            if (photo.isMain && updatedPhotos.length > 0) {
                                await setMainPhoto(updatedPhotos[0].id, businessId);
                                const reloadedPhotos = await getBusinessPhotos(businessId);
                                setPhotos(reloadedPhotos);
                                onPhotosChange?.(reloadedPhotos);
                            }
                        } catch (error) {
                            console.error('Error deleting photo:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить фото');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSetMainPhoto = async (photo: PhotoMetadata) => {
        if (photo.isMain) return;

        try {
            setLoading(true);
            await setMainPhoto(photo.id, businessId);
            const updatedPhotos = await getBusinessPhotos(businessId);
            setPhotos(updatedPhotos);
            onPhotosChange?.(updatedPhotos);
        } catch (error) {
            console.error('Error setting main photo:', error);
            Alert.alert('Ошибка', 'Не удалось установить главное фото');
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B1538" />
                <Text style={styles.loadingText}>Загрузка фотографий...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Фотографии ({photos.length}/{maxPhotos})</Text>
                <View style={styles.addButtons}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddPhoto(true)}
                        disabled={loading}
                    >
                        <Text style={styles.addButtonText}>📷 Камера</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddPhoto(false)}
                        disabled={loading}
                    >
                        <Text style={styles.addButtonText}>🖼️ Галерея</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Photos Grid */}
            <ScrollView style={styles.scrollView}>
                <View style={styles.grid}>
                    {photos.map((photo) => (
                        <View key={photo.id} style={styles.photoContainer}>
                            <Image
                                source={{ uri: photo.thumbnailUrl }}
                                style={styles.photo}
                                resizeMode="cover"
                            />
                            {photo.isMain && (
                                <View style={styles.mainBadge}>
                                    <Text style={styles.mainBadgeText}>Главное</Text>
                                </View>
                            )}
                            <View style={styles.photoActions}>
                                {!photo.isMain && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleSetMainPhoto(photo)}
                                    >
                                        <Text style={styles.actionButtonText}>⭐</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDeletePhoto(photo)}
                                >
                                    <Text style={styles.actionButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Загрузка...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    addButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addButton: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        padding: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    photoContainer: {
        width: '33.33%',
        aspectRatio: 1,
        padding: 4,
    },
    photo: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
    },
    mainBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#8B1538',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    mainBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    photoActions: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
    },
    actionButtonText: {
        fontSize: 16,
        color: '#1D1D1F',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#1D1D1F',
    },
});