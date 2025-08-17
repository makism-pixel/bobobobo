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
import { doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface StaffMember {
    id: string;
    name: string;
    position: string;
    schedule: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    isActive: boolean;
    phone: string;
    notes: string;
}

interface NewStaffMember {
    name: string;
    position: string;
    schedule: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    isActive: boolean;
    phone: string;
    notes: string;
}

export default function StaffScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
    const [saving, setSaving] = useState(false);

    const [newMember, setNewMember] = useState<NewStaffMember>({
        name: '',
        position: '',
        schedule: {
            monday: '9:00 - 18:00',
            tuesday: '9:00 - 18:00',
            wednesday: '9:00 - 18:00',
            thursday: '9:00 - 18:00',
            friday: '9:00 - 18:00',
            saturday: '10:00 - 16:00',
            sunday: 'Выходной'
        },
        isActive: true,
        phone: '',
        notes: ''
    });

    const weekDays = [
        { key: 'monday', label: 'Понедельник' },
        { key: 'tuesday', label: 'Вторник' },
        { key: 'wednesday', label: 'Среда' },
        { key: 'thursday', label: 'Четверг' },
        { key: 'friday', label: 'Пятница' },
        { key: 'saturday', label: 'Суббота' },
        { key: 'sunday', label: 'Воскресенье' }
    ];

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        if (!user) return;

        try {
            const staffQuery = query(
                collection(db, 'staff'),
                where('businessId', '==', user.uid)
            );
            const snapshot = await getDocs(staffQuery);
            const staffData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as StaffMember[];

            setStaff(staffData);
        } catch (error) {
            console.error('Error loading staff:', error);
            Alert.alert('Ошибка', 'Не удалось загрузить список персонала');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!user) return;

        if (!newMember.name || !newMember.position || !newMember.phone) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните обязательные поля');
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, 'staff'), {
                ...newMember,
                businessId: user.uid,
                createdAt: new Date()
            });

            setShowAddModal(false);
            setNewMember({
                name: '',
                position: '',
                schedule: {
                    monday: '9:00 - 18:00',
                    tuesday: '9:00 - 18:00',
                    wednesday: '9:00 - 18:00',
                    thursday: '9:00 - 18:00',
                    friday: '9:00 - 18:00',
                    saturday: '10:00 - 16:00',
                    sunday: 'Выходной'
                },
                isActive: true,
                phone: '',
                notes: ''
            });
            loadStaff();
            Alert.alert('Успешно', 'Сотрудник добавлен');
        } catch (error) {
            console.error('Error adding staff member:', error);
            Alert.alert('Ошибка', 'Не удалось добавить сотрудника');
        } finally {
            setSaving(false);
        }
    };

    const handleEditMember = async () => {
        if (!selectedMember) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, 'staff', selectedMember.id), {
                ...selectedMember,
                updatedAt: new Date()
            });

            setShowEditModal(false);
            loadStaff();
            Alert.alert('Успешно', 'Данные сотрудника обновлены');
        } catch (error) {
            console.error('Error updating staff member:', error);
            Alert.alert('Ошибка', 'Не удалось обновить данные сотрудника');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMember = async (member: StaffMember) => {
        Alert.alert(
            'Удаление сотрудника',
            `Вы уверены, что хотите удалить ${member.name}?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'staff', member.id));
                            loadStaff();
                            Alert.alert('Успешно', 'Сотрудник удален');
                        } catch (error) {
                            console.error('Error deleting staff member:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить сотрудника');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B1538" />
                <Text style={styles.loadingText}>Загрузка данных...</Text>
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
                <Text style={styles.title}>Персонал</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addButton}>+ Добавить</Text>
                </TouchableOpacity>
            </View>

            {/* Staff List */}
            <ScrollView style={styles.content}>
                {staff.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>Нет сотрудников</Text>
                        <Text style={styles.emptyText}>
                            Добавьте своих сотрудников, чтобы управлять их графиком работы
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Text style={styles.emptyButtonText}>+ Добавить сотрудника</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    staff.map((member) => (
                        <View key={member.id} style={styles.staffCard}>
                            <View style={styles.staffHeader}>
                                <View>
                                    <Text style={styles.staffName}>{member.name}</Text>
                                    <Text style={styles.staffPosition}>{member.position}</Text>
                                </View>
                                <Switch
                                    value={member.isActive}
                                    onValueChange={(value) => {
                                        const updatedMember = { ...member, isActive: value };
                                        setSelectedMember(updatedMember);
                                        handleEditMember();
                                    }}
                                    trackColor={{ false: '#E5E5EA', true: '#8B1538' }}
                                    thumbColor={'#FFFFFF'}
                                />
                            </View>

                            <View style={styles.staffInfo}>
                                <Text style={styles.infoLabel}>Телефон:</Text>
                                <Text style={styles.infoText}>{member.phone}</Text>
                            </View>

                            <View style={styles.scheduleContainer}>
                                <Text style={styles.scheduleTitle}>График работы:</Text>
                                {weekDays.map((day) => (
                                    <View key={day.key} style={styles.scheduleRow}>
                                        <Text style={styles.dayLabel}>{day.label}:</Text>
                                        <Text style={styles.dayTime}>
                                            {member.schedule[day.key as keyof typeof member.schedule]}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {member.notes && (
                                <View style={styles.notesContainer}>
                                    <Text style={styles.notesLabel}>Заметки:</Text>
                                    <Text style={styles.notesText}>{member.notes}</Text>
                                </View>
                            )}

                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => {
                                        setSelectedMember(member);
                                        setShowEditModal(true);
                                    }}
                                >
                                    <Text style={styles.editButtonText}>Редактировать</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteMember(member)}
                                >
                                    <Text style={styles.deleteButtonText}>Удалить</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add Staff Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <Text style={styles.modalCancelButton}>Отмена</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Новый сотрудник</Text>
                        <TouchableOpacity
                            onPress={handleAddMember}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#8B1538" />
                            ) : (
                                <Text style={styles.modalSaveButton}>Добавить</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Имя *</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.name}
                                onChangeText={(text) => setNewMember({ ...newMember, name: text })}
                                placeholder="Имя сотрудника"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Должность *</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.position}
                                onChangeText={(text) => setNewMember({ ...newMember, position: text })}
                                placeholder="Например: Официант"
                                placeholderTextColor="#8E8E93"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Телефон *</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.phone}
                                onChangeText={(text) => setNewMember({ ...newMember, phone: text })}
                                placeholder="+371 XX XXX XXX"
                                placeholderTextColor="#8E8E93"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>График работы</Text>
                            {weekDays.map((day) => (
                                <View key={day.key} style={styles.scheduleInput}>
                                    <Text style={styles.dayLabel}>{day.label}</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        value={newMember.schedule[day.key as keyof typeof newMember.schedule]}
                                        onChangeText={(text) => setNewMember({
                                            ...newMember,
                                            schedule: {
                                                ...newMember.schedule,
                                                [day.key]: text
                                            }
                                        })}
                                        placeholder="9:00 - 18:00"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Заметки</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={newMember.notes}
                                onChangeText={(text) => setNewMember({ ...newMember, notes: text })}
                                placeholder="Дополнительная информация..."
                                placeholderTextColor="#8E8E93"
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowEditModal(false)}>
                            <Text style={styles.modalCancelButton}>Отмена</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Редактировать</Text>
                        <TouchableOpacity
                            onPress={handleEditMember}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#8B1538" />
                            ) : (
                                <Text style={styles.modalSaveButton}>Сохранить</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {selectedMember && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Имя *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={selectedMember.name}
                                        onChangeText={(text) =>
                                            setSelectedMember({ ...selectedMember, name: text })
                                        }
                                        placeholder="Имя сотрудника"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Должность *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={selectedMember.position}
                                        onChangeText={(text) =>
                                            setSelectedMember({ ...selectedMember, position: text })
                                        }
                                        placeholder="Например: Официант"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Телефон *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={selectedMember.phone}
                                        onChangeText={(text) =>
                                            setSelectedMember({ ...selectedMember, phone: text })
                                        }
                                        placeholder="+371 XX XXX XXX"
                                        placeholderTextColor="#8E8E93"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>График работы</Text>
                                    {weekDays.map((day) => (
                                        <View key={day.key} style={styles.scheduleInput}>
                                            <Text style={styles.dayLabel}>{day.label}</Text>
                                            <TextInput
                                                style={styles.timeInput}
                                                value={
                                                    selectedMember.schedule[
                                                    day.key as keyof typeof selectedMember.schedule
                                                    ]
                                                }
                                                onChangeText={(text) =>
                                                    setSelectedMember({
                                                        ...selectedMember,
                                                        schedule: {
                                                            ...selectedMember.schedule,
                                                            [day.key]: text
                                                        }
                                                    })
                                                }
                                                placeholder="9:00 - 18:00"
                                                placeholderTextColor="#8E8E93"
                                            />
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Заметки</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={selectedMember.notes}
                                        onChangeText={(text) =>
                                            setSelectedMember({ ...selectedMember, notes: text })
                                        }
                                        placeholder="Дополнительная информация..."
                                        placeholderTextColor="#8E8E93"
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
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
        padding: 16,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 24,
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#8B1538',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Staff Card
    staffCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    staffHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    staffName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    staffPosition: {
        fontSize: 14,
        color: '#8E8E93',
    },
    staffInfo: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 16,
        color: '#1D1D1F',
    },

    // Schedule
    scheduleContainer: {
        marginBottom: 12,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dayLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    dayTime: {
        fontSize: 14,
        color: '#1D1D1F',
    },

    // Notes
    notesContainer: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    notesLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 14,
        color: '#1D1D1F',
    },

    // Card Actions
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#8B1538',
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    modalCancelButton: {
        fontSize: 16,
        color: '#8E8E93',
    },
    modalSaveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B1538',
    },
    modalContent: {
        padding: 24,
    },

    // Form
    formGroup: {
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
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    scheduleInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 12,
        width: 150,
        fontSize: 14,
        color: '#1D1D1F',
        textAlign: 'center',
    },
});
