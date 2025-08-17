import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    recommended?: boolean;
    color: string;
    icon: string;
}

const pricingPlans: PricingPlan[] = [
    {
        id: 'basic',
        name: 'Базовый',
        price: '9.99',
        period: 'в месяц',
        description: 'Для небольших заведений',
        color: '#34C759',
        icon: '🌱',
        features: [
            'Базовый профиль заведения',
            'До 10 фотографий',
            'Основное меню',
            'Управление персоналом (до 5 сотрудников)',
            'Базовая планировка террасы',
            'Отзывы и рейтинги',
            'Базовая статистика',
            'Email поддержка'
        ]
    },
    {
        id: 'business',
        name: 'Бизнес',
        price: '19.99',
        period: 'в месяц',
        description: 'Максимальные возможности',
        color: '#8B1538',
        icon: '👑',
        recommended: true,
        features: [
            'Все функции базового тарифа',
            'Расширенный профиль заведения',
            'Неограниченное количество фото',
            'Расширенное меню с категориями',
            'Управление персоналом (без ограничений)',
            'Продвинутая планировка террасы',
            'Приоритетное размещение',
            'Система бронирования столиков',
            'Расширенная аналитика',
            'Приоритетная поддержка 24/7'
        ]
    }
];

export default function PricingScreen() {
    const { user } = useAuth();
    const { businessName, isApproved } = useUserRole();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
        const plan = pricingPlans.find(p => p.id === planId);

        Alert.alert(
            'Выбор тарифа',
            `Вы выбрали тариф "${plan?.name}" за ${plan?.price} ${plan?.period}.\n\nИнтеграция с платежной системой будет добавлена в следующих версиях.`,
            [{ text: 'Понятно', style: 'default' }]
        );
    };

    if (!user || !isApproved) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Тарифы</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>🚫</Text>
                    <Text style={styles.errorTitle}>Доступ ограничен</Text>
                    <Text style={styles.errorSubtitle}>
                        Тарифные планы доступны только владельцам одобренных заведений
                    </Text>
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
                <Text style={styles.title}>Тарифы</Text>
            </View>

            {/* Subtitle */}
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>{businessName}</Text>
                <Text style={styles.description}>
                    Выберите подходящий тарифный план для развития вашего бизнеса
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Intro Section */}
                <View style={styles.introSection}>
                    <Text style={styles.introIcon}>💼</Text>
                    <Text style={styles.introTitle}>Развивайте свой бизнес</Text>
                    <Text style={styles.introDescription}>
                        Наши тарифные планы помогут вам привлечь больше клиентов и увеличить прибыль
                    </Text>
                </View>

                {/* Pricing Plans */}
                <View style={styles.plansContainer}>
                    {pricingPlans.map((plan) => (
                        <View
                            key={plan.id}
                            style={[
                                styles.planCard,
                                plan.recommended && styles.recommendedCard,
                                selectedPlan === plan.id && styles.selectedCard
                            ]}
                        >
                            {plan.recommended && (
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedText}>РЕКОМЕНДУЕМ</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <Text style={styles.planIcon}>{plan.icon}</Text>
                                <Text style={[styles.planName, { color: plan.color }]}>
                                    {plan.name}
                                </Text>
                                <Text style={styles.planDescription}>
                                    {plan.description}
                                </Text>
                            </View>

                            <View style={styles.priceSection}>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.currency, { color: plan.color }]}>€</Text>
                                    <Text style={[styles.price, { color: plan.color }]}>
                                        {plan.price}
                                    </Text>
                                </View>
                                <Text style={styles.period}>{plan.period}</Text>
                            </View>

                            <View style={styles.featuresSection}>
                                {plan.features.map((feature, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        <Text style={[styles.checkIcon, { color: plan.color }]}>✓</Text>
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.selectButton,
                                    { backgroundColor: plan.color },
                                    selectedPlan === plan.id && styles.selectedButton
                                ]}
                                onPress={() => handleSelectPlan(plan.id)}
                            >
                                <Text style={styles.selectButtonText}>
                                    {selectedPlan === plan.id ? 'Выбран' : 'Выбрать план'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.faqTitle}>❓ Часто задаваемые вопросы</Text>

                    <View style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>Можно ли изменить тариф в любое время?</Text>
                        <Text style={styles.faqAnswer}>
                            Да, вы можете перейти на другой тариф в любое время.
                            Изменения вступят в силу с следующего расчетного периода.
                        </Text>
                    </View>

                    <View style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>Есть ли бесплатный пробный период?</Text>
                        <Text style={styles.faqAnswer}>
                            Мы предоставляем 7 дней бесплатного использования
                            Премиум-тарифа для новых пользователей.
                        </Text>
                    </View>

                    <View style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>Какие способы оплаты принимаются?</Text>
                        <Text style={styles.faqAnswer}>
                            Мы принимаем оплату банковскими картами, PayPal
                            и банковскими переводами.
                        </Text>
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.supportSection}>
                    <View style={styles.supportCard}>
                        <Text style={styles.supportIcon}>💬</Text>
                        <View style={styles.supportContent}>
                            <Text style={styles.supportTitle}>Нужна помощь?</Text>
                            <Text style={styles.supportSubtitle}>
                                Наша команда поможет выбрать подходящий тариф
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.supportButton}
                            onPress={() => Alert.alert('Поддержка', 'Функция связи с поддержкой будет добавлена')}
                        >
                            <Text style={styles.supportButtonText}>Связаться</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    introSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    introIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
        textAlign: 'center',
    },
    introDescription: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 24,
    },
    plansContainer: {
        gap: 20,
        marginBottom: 32,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    recommendedCard: {
        borderColor: '#8B1538',
        transform: [{ scale: 1.02 }],
    },
    selectedCard: {
        borderColor: '#34C759',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -10,
        left: 20,
        right: 20,
        backgroundColor: '#8B1538',
        borderRadius: 20,
        paddingVertical: 8,
        alignItems: 'center',
    },
    recommendedText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    planHeader: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 12,
    },
    planIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    planName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    planDescription: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
    priceSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 8,
        marginRight: 4,
    },
    price: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 56,
    },
    period: {
        fontSize: 16,
        color: '#8E8E93',
    },
    featuresSection: {
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkIcon: {
        fontSize: 18,
        fontWeight: '700',
        marginRight: 12,
        width: 20,
    },
    featureText: {
        fontSize: 16,
        color: '#1D1D1F',
        flex: 1,
        lineHeight: 22,
    },
    selectButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    selectedButton: {
        opacity: 0.8,
    },
    selectButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    faqSection: {
        marginBottom: 32,
    },
    faqTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    supportSection: {
        marginBottom: 20,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    supportIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    supportContent: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    supportSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    supportButton: {
        backgroundColor: '#8B1538',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    supportButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
}); 