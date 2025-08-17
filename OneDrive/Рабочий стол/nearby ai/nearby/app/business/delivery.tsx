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
import { doc, getDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface DeliverySettings {
    hasDelivery: boolean;
    deliveryRadius: number;
    minOrderAmount: number;
    deliveryFee: number;
    freeDeliveryAmount: number;
    estimatedTime: string;
    deliveryHours: string;
    acceptsCash: boolean;
    acceptsCards: boolean;
    acceptsOnlinePayment: boolean;
    packagingFee: number;
}

export default function DeliverySettingsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [settings, setSettings] = useState<DeliverySettings>({
        hasDelivery: false,
        deliveryRadius: 5,
        minOrderAmount: 10,
        deliveryFee: 3,
        freeDeliveryAmount: 30,
        estimatedTime: '30-45',
        deliveryHours: '10:00-22:00',
        acceptsCash: true,
        acceptsCards: true,
        acceptsOnlinePayment: false,
        packagingFee: 0
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
                    hasDelivery: data.hasDelivery || false,
                    deliveryRadius: data.deliveryRadius || 5,
                    minOrderAmount: data.minOrderAmount || 10,
                    deliveryFee: data.deliveryFee || 3,
                    freeDeliveryAmount: data.freeDeliveryAmount || 30,
                    estimatedTime: data.estimatedTime || '30-45',
                    deliveryHours: data.deliveryHours || '10:00-22:00',
                    acceptsCash: data.acceptsCash !== false,
                    acceptsCards: data.acceptsCards !== false,
                    acceptsOnlinePayment: data.acceptsOnlinePayment || false,
                    packagingFee: data.packagingFee || 0
                });
            } else {
                console.log('Business not found for user:', user.uid);
                // Устанавливаем дефолтные настройки для нового бизнеса
                setBusinessId(user.uid);
            }
        } catch (error) {
            console.error('Error loading delivery settings:', error);
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

            Alert.alert('Успешно', 'Настройки доставки сохранены');
            router.back();
        } catch (error) {
            console.error('Error saving delivery settings:', error);
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
                <Text style={styles.headerTitle}>Настройки доставки</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Основной переключатель */}
                <View style={styles.mainToggle}>
                    <View style={styles.toggleContent}>
                        <Text style={styles.toggleTitle}>Доставка доступна</Text>
                        <Text style={styles.toggleSubtitle}>
                            Клиенты смогут заказать доставку
                        </Text>
                    </View>
                    <Switch
                        value={settings.hasDelivery}
                        onValueChange={(value) => setSettings({ ...settings, hasDelivery: value })}
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {settings.hasDelivery && (
                    <>
                        {/* Радиус доставки */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Радиус доставки (км)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.deliveryRadius.toString()}
                                onChangeText={(text) => {
                                    const num = parseFloat(text) || 0;
                                    setSettings({ ...settings, deliveryRadius: num });
                                }}
                                keyboardType="decimal-pad"
                                placeholder="5"
                            />
                        </View>

                        {/* Стоимость доставки */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Стоимость и условия</Text>
                            <View style={styles.row}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Стоимость доставки (€)</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={settings.deliveryFee.toString()}
                                        onChangeText={(text) => {
                                            const num = parseFloat(text) || 0;
                                            setSettings({ ...settings, deliveryFee: num });
                                        }}
                                        keyboardType="decimal-pad"
                                        placeholder="3"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Мин. сумма заказа (€)</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={settings.minOrderAmount.toString()}
                                        onChangeText={(text) => {
                                            const num = parseFloat(text) || 0;
                                            setSettings({ ...settings, minOrderAmount: num });
                                        }}
                                        keyboardType="decimal-pad"
                                        placeholder="10"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Бесплатная доставка */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Бесплатная доставка от (€)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.freeDeliveryAmount.toString()}
                                onChangeText={(text) => {
                                    const num = parseFloat(text) || 0;
                                    setSettings({ ...settings, freeDeliveryAmount: num });
                                }}
                                keyboardType="decimal-pad"
                                placeholder="30"
                            />
                            <Text style={styles.hint}>Оставьте 0, если нет бесплатной доставки</Text>
                        </View>

                        {/* Время доставки */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Время доставки (минут)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.estimatedTime}
                                onChangeText={(text) => setSettings({ ...settings, estimatedTime: text })}
                                placeholder="30-45"
                            />
                        </View>

                        {/* Часы доставки */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Часы работы доставки</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.deliveryHours}
                                onChangeText={(text) => setSettings({ ...settings, deliveryHours: text })}
                                placeholder="10:00-22:00"
                            />
                        </View>

                        {/* Упаковка */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Стоимость упаковки (€)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.packagingFee.toString()}
                                onChangeText={(text) => {
                                    const num = parseFloat(text) || 0;
                                    setSettings({ ...settings, packagingFee: num });
                                }}
                                keyboardType="decimal-pad"
                                placeholder="0"
                            />
                        </View>

                        {/* Способы оплаты */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Способы оплаты при доставке</Text>

                            <View style={styles.paymentOption}>
                                <View style={styles.toggleContent}>
                                    <Text style={styles.toggleTitle}>💵 Наличные</Text>
                                </View>
                                <Switch
                                    value={settings.acceptsCash}
                                    onValueChange={(value) => setSettings({ ...settings, acceptsCash: value })}
                                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            <View style={styles.paymentOption}>
                                <View style={styles.toggleContent}>
                                    <Text style={styles.toggleTitle}>💳 Карта курьеру</Text>
                                </View>
                                <Switch
                                    value={settings.acceptsCards}
                                    onValueChange={(value) => setSettings({ ...settings, acceptsCards: value })}
                                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            <View style={styles.paymentOption}>
                                <View style={styles.toggleContent}>
                                    <Text style={styles.toggleTitle}>🌐 Онлайн оплата</Text>
                                </View>
                                <Switch
                                    value={settings.acceptsOnlinePayment}
                                    onValueChange={(value) => setSettings({ ...settings, acceptsOnlinePayment: value })}
                                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
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
    toggleContent: {
        flex: 1,
        marginRight: 12,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    toggleSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
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
    hint: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 8,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
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
