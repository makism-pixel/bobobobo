import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Image,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    imageUrl?: string;
    isTextBased: boolean;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function BusinessMenuScreen() {
    const { user } = useAuth();
    const { businessId, businessName, isApproved } = useUserRole();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Состояние формы
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Основные блюда',
        isTextBased: true
    });

    const categories = [
        'Основные блюда',
        'Напитки',
        'Десерты',
        'Закуски',
        'Салаты',
        'Супы',
        'Пицца',
        'Паста',
        'Другое'
    ];

    useEffect(() => {
        if (!user || !businessId || !isApproved) {
            setLoading(false);
            return;
        }

        // Загружаем меню для этого бизнеса
        const q = query(
            collection(db, 'businessMenu'),
            where('businessId', '==', businessId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: MenuItem[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as MenuItem);
            });

            // Сортируем по категориям
            items.sort((a, b) => a.category.localeCompare(b.category));
            setMenuItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, businessId, isApproved]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setNewItem({ ...newItem, isTextBased: false });
        }
    };

    const createMenuItem = async () => {
        if (!user || !businessId) return;

        if (!newItem.name.trim() || !newItem.price.trim()) {
            Alert.alert('Ошибка', 'Заполните название и цену блюда');
            return;
        }

        try {
            const itemId = `${businessId}_${Date.now()}`;
            const itemData = {
                ...newItem,
                id: itemId,
                businessId,
                businessName,
                userId: user.uid,
                imageUrl: selectedImage || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'businessMenu', itemId), itemData);

            Alert.alert('Успех', 'Блюдо добавлено в меню!');
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating menu item:', error);
            Alert.alert('Ошибка', 'Не удалось добавить блюдо');
        }
    };

    const deleteMenuItem = async (itemId: string, itemName: string) => {
        Alert.alert(
            'Удалить блюдо',
            `Вы уверены, что хотите удалить "${itemName}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'businessMenu', itemId));
                            Alert.alert('Успех', 'Блюдо удалено');
                        } catch (error) {
                            console.error('Error deleting menu item:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить блюдо');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setNewItem({
            name: '',
            description: '',
            price: '',
            category: 'Основные блюда',
            isTextBased: true
        });
        setSelectedImage(null);
    };

    const groupedItems = menuItems.reduce((groups, item) => {
        const category = item.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(item);
        return groups;
    }, {} as Record<string, MenuItem[]>);

    if (!user || !isApproved) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Меню</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>🚫</Text>
                    <Text style={styles.errorTitle}>Доступ ограничен</Text>
                    <Text style={styles.errorSubtitle}>
                        Управление меню доступно только владельцам одобренных заведений
                    </Text>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Меню</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Загружаем меню...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Меню</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Text style={styles.addButtonText}>+ Добавить</Text>
                </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>{businessName}</Text>
                <Text style={styles.description}>
                    Управляйте меню вашего заведения
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {menuItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🍽️</Text>
                        <Text style={styles.emptyTitle}>Меню пусто</Text>
                        <Text style={styles.emptySubtitle}>
                            Добавьте первое блюдо в ваше меню
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.primaryButtonText}>Добавить блюдо</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    Object.entries(groupedItems).map(([category, items]) => (
                        <View key={category} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category}</Text>
                            {items.map((item) => (
                                <View key={item.id} style={styles.menuItemCard}>
                                    <View style={styles.itemContent}>
                                        {item.imageUrl && !item.isTextBased && (
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                style={styles.itemImage}
                                            />
                                        )}
                                        <View style={styles.itemInfo}>
                                            <View style={styles.itemHeader}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemPrice}>{item.price}</Text>
                                            </View>
                                            {item.description && (
                                                <Text style={styles.itemDescription}>
                                                    {item.description}
                                                </Text>
                                            )}
                                            <View style={styles.itemMeta}>
                                                <Text style={styles.itemType}>
                                                    {item.isTextBased ? '📝 Текст' : '📸 Фото'}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => deleteMenuItem(item.id, item.name)}
                                                    style={styles.deleteButton}
                                                >
                                                    <Text style={styles.deleteButtonText}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal создания блюда */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => {
                            setShowCreateModal(false);
                            resetForm();
                        }}>
                            <Text style={styles.modalCancel}>Отмена</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Новое блюдо</Text>
                        <TouchableOpacity onPress={createMenuItem}>
                            <Text style={styles.modalSave}>Добавить</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Тип блюда</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        newItem.isTextBased && styles.typeOptionSelected
                                    ]}
                                    onPress={() => setNewItem({ ...newItem, isTextBased: true })}
                                >
                                    <Text style={styles.typeOptionIcon}>📝</Text>
                                    <Text style={styles.typeOptionText}>Текстовое описание</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        !newItem.isTextBased && styles.typeOptionSelected
                                    ]}
                                    onPress={() => setNewItem({ ...newItem, isTextBased: false })}
                                >
                                    <Text style={styles.typeOptionIcon}>📸</Text>
                                    <Text style={styles.typeOptionText}>С фотографией</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {!newItem.isTextBased && (
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Фотография</Text>
                                <TouchableOpacity
                                    style={styles.imagePickerButton}
                                    onPress={pickImage}
                                >
                                    {selectedImage ? (
                                        <Image
                                            source={{ uri: selectedImage }}
                                            style={styles.selectedImage}
                                        />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Text style={styles.imagePlaceholderIcon}>📸</Text>
                                            <Text style={styles.imagePlaceholderText}>
                                                Выберите фотографию
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Название *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newItem.name}
                                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                                placeholder="Например: Борщ украинский"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Описание</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={newItem.description}
                                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                placeholder="Описание блюда, состав, особенности..."
                                placeholderTextColor="#8E8E93"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Цена *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newItem.price}
                                onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                                placeholder="Например: 15.50 €"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Категория</Text>
                            <View style={styles.categoryGrid}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryOption,
                                            newItem.category === category && styles.categoryOptionSelected
                                        ]}
                                        onPress={() => setNewItem({ ...newItem, category })}
                                    >
                                        <Text style={styles.categoryOptionText}>{category}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
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
    backButton: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    addButton: {
        backgroundColor: '#8B1538',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    subtitleContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B1538',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#8E8E93',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
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
    errorSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
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
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#8B1538',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    menuItemCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemContent: {
        flexDirection: 'row',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1D1D1F',
        flex: 1,
        marginRight: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B1538',
    },
    itemDescription: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
        marginBottom: 8,
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemType: {
        fontSize: 12,
        color: '#8B1538',
        fontWeight: '600',
    },
    deleteButton: {
        padding: 4,
    },
    deleteButtonText: {
        fontSize: 16,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
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
    modalCancel: {
        fontSize: 16,
        color: '#8E8E93',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    modalSave: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    formGroup: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1D1D1F',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeOption: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    typeOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F5',
    },
    typeOptionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        textAlign: 'center',
    },
    imagePickerButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        fontSize: 16,
        color: '#8E8E93',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
    },
    categoryOptionSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F5',
    },
    categoryOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
    },
}); 