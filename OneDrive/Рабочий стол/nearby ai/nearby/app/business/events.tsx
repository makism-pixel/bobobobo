import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Switch
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface BusinessEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    eventType: 'discount' | 'event' | 'promotion' | 'announcement';
    isActive: boolean;
    businessId: string;
    discount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function BusinessEventsScreen() {
    const { user } = useAuth();
    const { businessId, businessName, isApproved } = useUserRole();
    const [events, setEvents] = useState<BusinessEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Состояние формы создания события
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        eventType: 'event' as BusinessEvent['eventType'],
        discount: 0,
        isActive: true
    });

    useEffect(() => {
        if (!user || !businessId || !isApproved) {
            setLoading(false);
            return;
        }

        // Загружаем события для этого бизнеса
        const q = query(
            collection(db, 'businessEvents'),
            where('businessId', '==', businessId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsList: BusinessEvent[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                eventsList.push({
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate() || new Date(),
                    endDate: data.endDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as BusinessEvent);
            });

            // Сортируем по дате создания (новые первыми)
            eventsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setEvents(eventsList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, businessId, isApproved]);

    const createEvent = async () => {
        if (!user || !businessId) return;

        if (!newEvent.title.trim() || !newEvent.description.trim()) {
            Alert.alert('Ошибка', 'Заполните название и описание события');
            return;
        }

        try {
            const eventId = `${businessId}_${Date.now()}`;
            const eventData = {
                ...newEvent,
                id: eventId,
                businessId,
                businessName,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'businessEvents', eventId), eventData);

            Alert.alert('Успех', 'Событие создано успешно!');
            setShowCreateModal(false);
            setNewEvent({
                title: '',
                description: '',
                startDate: new Date(),
                endDate: new Date(),
                eventType: 'event',
                discount: 0,
                isActive: true
            });
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Ошибка', 'Не удалось создать событие');
        }
    };

    const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, 'businessEvents', eventId), {
                isActive: !currentStatus,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating event status:', error);
            Alert.alert('Ошибка', 'Не удалось обновить статус события');
        }
    };

    const deleteEvent = async (eventId: string, eventTitle: string) => {
        Alert.alert(
            'Удалить событие',
            `Вы уверены, что хотите удалить событие "${eventTitle}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'businessEvents', eventId));
                            Alert.alert('Успех', 'Событие удалено');
                        } catch (error) {
                            console.error('Error deleting event:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить событие');
                        }
                    }
                }
            ]
        );
    };

    const getEventTypeIcon = (type: BusinessEvent['eventType']) => {
        switch (type) {
            case 'discount': return '💰';
            case 'event': return '🎉';
            case 'promotion': return '🚀';
            case 'announcement': return '📢';
            default: return '📅';
        }
    };

    const getEventTypeText = (type: BusinessEvent['eventType']) => {
        switch (type) {
            case 'discount': return 'Скидка';
            case 'event': return 'Мероприятие';
            case 'promotion': return 'Акция';
            case 'announcement': return 'Объявление';
            default: return 'Событие';
        }
    };

    if (!user || !isApproved) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>События</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>🚫</Text>
                    <Text style={styles.errorTitle}>Доступ ограничен</Text>
                    <Text style={styles.errorSubtitle}>
                        Управление событиями доступно только владельцам одобренных заведений
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
                    <Text style={styles.title}>События</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#8B1538" />
                    <Text style={styles.loadingText}>Загружаем события...</Text>
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
                <Text style={styles.title}>События</Text>
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
                    Создавайте события, акции и объявления для ваших клиентов
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {events.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyTitle}>Нет событий</Text>
                        <Text style={styles.emptySubtitle}>
                            Создайте первое событие для привлечения клиентов
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.primaryButtonText}>Создать событие</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    events.map((event) => (
                        <View key={event.id} style={styles.eventCard}>
                            <View style={styles.eventHeader}>
                                <View style={styles.eventTypeContainer}>
                                    <Text style={styles.eventTypeIcon}>
                                        {getEventTypeIcon(event.eventType)}
                                    </Text>
                                    <Text style={styles.eventTypeText}>
                                        {getEventTypeText(event.eventType)}
                                    </Text>
                                </View>
                                <View style={styles.eventActions}>
                                    <Switch
                                        value={event.isActive}
                                        onValueChange={(value) => toggleEventStatus(event.id, event.isActive)}
                                        thumbColor={event.isActive ? '#34C759' : '#8E8E93'}
                                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => deleteEvent(event.id, event.title)}
                                        style={styles.deleteButton}
                                    >
                                        <Text style={styles.deleteButtonText}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventDescription}>{event.description}</Text>

                            {event.eventType === 'discount' && event.discount > 0 && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>-{event.discount}%</Text>
                                </View>
                            )}

                            <View style={styles.eventDates}>
                                <Text style={styles.eventDate}>
                                    📅 {event.startDate.toLocaleDateString('ru-RU')}
                                    {event.startDate.toDateString() !== event.endDate.toDateString() &&
                                        ` - ${event.endDate.toLocaleDateString('ru-RU')}`
                                    }
                                </Text>
                            </View>

                            <View style={styles.eventStatus}>
                                <View style={[
                                    styles.statusBadge,
                                    event.isActive ? styles.activeBadge : styles.inactiveBadge
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        event.isActive ? styles.activeText : styles.inactiveText
                                    ]}>
                                        {event.isActive ? 'АКТИВНО' : 'НЕАКТИВНО'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal создания события */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Text style={styles.modalCancel}>Отмена</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Новое событие</Text>
                        <TouchableOpacity onPress={createEvent}>
                            <Text style={styles.modalSave}>Создать</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Название *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newEvent.title}
                                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                                placeholder="Например: Скидка 20% на все меню"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Описание *</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={newEvent.description}
                                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                                placeholder="Подробное описание события..."
                                placeholderTextColor="#8E8E93"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Тип события</Text>
                            <View style={styles.eventTypeGrid}>
                                {[
                                    { type: 'discount', icon: '💰', label: 'Скидка' },
                                    { type: 'event', icon: '🎉', label: 'Мероприятие' },
                                    { type: 'promotion', icon: '🚀', label: 'Акция' },
                                    { type: 'announcement', icon: '📢', label: 'Объявление' }
                                ].map((item) => (
                                    <TouchableOpacity
                                        key={item.type}
                                        style={[
                                            styles.eventTypeOption,
                                            newEvent.eventType === item.type && styles.eventTypeSelected
                                        ]}
                                        onPress={() => setNewEvent({ ...newEvent, eventType: item.type as BusinessEvent['eventType'] })}
                                    >
                                        <Text style={styles.eventTypeOptionIcon}>{item.icon}</Text>
                                        <Text style={styles.eventTypeOptionLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {newEvent.eventType === 'discount' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Размер скидки (%)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={newEvent.discount.toString()}
                                    onChangeText={(text) => setNewEvent({ ...newEvent, discount: parseInt(text) || 0 })}
                                    placeholder="Например: 20"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <View style={styles.switchRow}>
                                <Text style={styles.formLabel}>Активировать сразу</Text>
                                <Switch
                                    value={newEvent.isActive}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, isActive: value })}
                                    thumbColor={newEvent.isActive ? '#34C759' : '#8E8E93'}
                                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                />
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
        lineHeight: 20,
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
        lineHeight: 24,
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
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    eventTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventTypeIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    eventTypeText: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '600',
    },
    eventActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteButton: {
        padding: 4,
    },
    deleteButtonText: {
        fontSize: 16,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
        marginBottom: 12,
    },
    discountBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    eventDates: {
        marginBottom: 12,
    },
    eventDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    eventStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#34C759',
    },
    inactiveBadge: {
        backgroundColor: '#8E8E93',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    activeText: {
        color: '#FFFFFF',
    },
    inactiveText: {
        color: '#FFFFFF',
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
        height: 100,
        textAlignVertical: 'top',
    },
    eventTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    eventTypeOption: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    eventTypeSelected: {
        borderColor: '#8B1538',
        backgroundColor: '#FFF5F5',
    },
    eventTypeOptionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    eventTypeOptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        textAlign: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}); 