import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface BookingSettings {
    acceptsReservations: boolean;
    minGuests: number;
    maxGuests: number;
    advanceBookingDays: number;
    reservationHours: string;
    requireDeposit: boolean;
    depositAmount: number;
    autoConfirm: boolean;
    tableCount: number;
    specialRequests: boolean;
}

export default function BookingSettingsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [settings, setSettings] = useState<BookingSettings>({
        acceptsReservations: false,
        minGuests: 1,
        maxGuests: 10,
        advanceBookingDays: 30,
        reservationHours: '10:00-22:00',
        requireDeposit: false,
        depositAmount: 0,
        autoConfirm: false,
        tableCount: 10,
        specialRequests: true
    });

    useEffect(() => {
        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        if (!user) return;

        try {
            let bizId = null;
            let businessDoc = null;

            // Ищем бизнес в approvedPlaces разными способами
            // 1. Сначала пробуем найти документы, где ID начинается с user.uid
            const q = query(collection(db, 'approvedPlaces'));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                if (doc.id.startsWith(user.uid)) {
                    bizId = doc.id;
                    businessDoc = doc;
                }
            });

            // 2. Если не нашли, пробуем точное совпадение с user.uid
            if (!bizId) {
                const directDoc = await getDoc(doc(db, 'approvedPlaces', user.uid));
                if (directDoc.exists()) {
                    bizId = user.uid;
                    businessDoc = directDoc;
                }
            }

            if (bizId && businessDoc) {
                setBusinessId(bizId);

                const data = businessDoc.data();
                setSettings({
                    acceptsReservations: data.acceptsReservations || false,
                    minGuests: data.minGuests || 1,
                    maxGuests: data.maxGuests || 10,
                    advanceBookingDays: data.advanceBookingDays || 30,
                    reservationHours: data.reservationHours || '10:00-22:00',
                    requireDeposit: data.requireDeposit || false,
                    depositAmount: data.depositAmount || 0,
                    autoConfirm: data.autoConfirm || false,
                    tableCount: data.tableCount || 10,
                    specialRequests: data.specialRequests !== false
                });
            } else {
                console.log('Business not found for user:', user.uid);
                // Устанавливаем дефолтные настройки для нового бизнеса
                setBusinessId(user.uid);
            }
        } catch (error) {
            console.error('Error loading booking settings:', error);
            // Не показываем Alert при загрузке, просто используем дефолтные настройки
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!businessId) {
            Alert.alert('Ошибка', 'Бизнес не найден');
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, 'approvedPlaces', businessId), {
                ...settings,
                updatedAt: new Date().toISOString()
            });

            Alert.alert('Успешно', 'Настройки бронирования сохранены');
            router.back();
        } catch (error) {
            console.error('Error saving booking settings:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить настройки');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B1538" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Настройки бронирования</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Основной переключатель */}
                <View style={styles.mainToggle}>
                    <View style={styles.toggleContent}>
                        <Text style={styles.toggleTitle}>Принимать бронирования</Text>
                        <Text style={styles.toggleSubtitle}>
                            Клиенты смогут бронировать столики
                        </Text>
                    </View>
                    <Switch
                        value={settings.acceptsReservations}
                        onValueChange={(value) => setSettings({ ...settings, acceptsReservations: value })}
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {settings.acceptsReservations && (
                    <>
                        {/* Количество гостей */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Количество гостей</Text>
                            <View style={styles.row}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Минимум</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={settings.minGuests.toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 1;
                                            setSettings({ ...settings, minGuests: num });
                                        }}
                                        keyboardType="numeric"
                                        placeholder="1"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Максимум</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={settings.maxGuests.toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 10;
                                            setSettings({ ...settings, maxGuests: num });
                                        }}
                                        keyboardType="numeric"
                                        placeholder="10"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Количество столиков */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Количество столиков</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.tableCount.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text) || 1;
                                    setSettings({ ...settings, tableCount: num });
                                }}
                                keyboardType="numeric"
                                placeholder="10"
                            />
                        </View>

                        {/* Часы бронирования */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Часы приема бронирований</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.reservationHours}
                                onChangeText={(text) => setSettings({ ...settings, reservationHours: text })}
                                placeholder="10:00-22:00"
                            />
                        </View>

                        {/* Заблаговременное бронирование */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>За сколько дней можно бронировать</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.advanceBookingDays.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text) || 1;
                                    setSettings({ ...settings, advanceBookingDays: num });
                                }}
                                keyboardType="numeric"
                                placeholder="30"
                            />
                        </View>

                        {/* Депозит */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleTitle}>Требовать депозит</Text>
                                <Text style={styles.toggleSubtitle}>
                                    Предоплата при бронировании
                                </Text>
                            </View>
                            <Switch
                                value={settings.requireDeposit}
                                onValueChange={(value) => setSettings({ ...settings, requireDeposit: value })}
                                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {settings.requireDeposit && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Сумма депозита (€)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.depositAmount.toString()}
                                    onChangeText={(text) => {
                                        const num = parseFloat(text) || 0;
                                        setSettings({ ...settings, depositAmount: num });
                                    }}
                                    keyboardType="decimal-pad"
                                    placeholder="10"
                                />
                            </View>
                        )}

                        {/* Автоподтверждение */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleTitle}>Автоподтверждение</Text>
                                <Text style={styles.toggleSubtitle}>
                                    Автоматически подтверждать бронирования
                                </Text>
                            </View>
                            <Switch
                                value={settings.autoConfirm}
                                onValueChange={(value) => setSettings({ ...settings, autoConfirm: value })}
                                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {/* Особые пожелания */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleTitle}>Особые пожелания</Text>
                                <Text style={styles.toggleSubtitle}>
                                    Разрешить клиентам оставлять пожелания
                                </Text>
                            </View>
                            <Switch
                                value={settings.specialRequests}
                                onValueChange={(value) => setSettings({ ...settings, specialRequests: value })}
                                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </>
                )}

                {/* Кнопка сохранения */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={saveSettings}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Сохранить настройки</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: '#8B1538',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    content: {
        padding: 20,
    },
    mainToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    toggleContent: {
        flex: 1,
        marginRight: 12,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    toggleSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1D1D1F',
    },
    numberInput: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1D1D1F',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#8B1538',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
