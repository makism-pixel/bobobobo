import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const features = [
    {
        icon: '📱',
        title: 'Легкое управление',
        description: 'Добавляйте фото, обновляйте меню и часы работы за минуты'
    },
    {
        icon: '👥',
        title: 'Новые клиенты',
        description: 'Привлекайте посетителей с AI-рекомендациями'
    },
    {
        icon: '📊',
        title: 'Аналитика',
        description: 'Отслеживайте просмотры и интерес к вашему заведению'
    },
    {
        icon: '💰',
        title: 'Больше продаж',
        description: 'Увеличьте прибыль с умными предложениями'
    }
];

const steps = [
    {
        number: '1',
        title: 'Заполните форму',
        description: 'Основная информация о заведении'
    },
    {
        number: '2',
        title: 'Модерация',
        description: 'Проверка за 24 часа'
    },
    {
        number: '3',
        title: 'Одобрение',
        description: 'Начинайте привлекать клиентов'
    }
];

export default function BusinessWelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroIcon}>🏪</Text>
                    <Text style={styles.heroTitle}>Добавьте своё заведение</Text>
                    <Text style={styles.heroSubtitle}>
                        Присоединитесь к Nearby AI и начните привлекать новых клиентов уже сегодня
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Почему стоит присоединиться?</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Process */}
                <View style={styles.processSection}>
                    <Text style={styles.sectionTitle}>Как это работает</Text>
                    <View style={styles.stepsContainer}>
                        {steps.map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{step.number}</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepDescription}>{step.description}</Text>
                                </View>
                                {index < steps.length - 1 && <View style={styles.stepConnector} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsSection}>
                    <View style={styles.benefitCard}>
                        <Text style={styles.benefitIcon}>⭐</Text>
                        <View style={styles.benefitContent}>
                            <Text style={styles.benefitTitle}>Полностью бесплатно</Text>
                            <Text style={styles.benefitDescription}>
                                Без скрытых платежей и комиссий. Просто добавьте заведение и начинайте!
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                    <Text style={styles.statsTitle}>Наша платформа растёт</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>1K+</Text>
                            <Text style={styles.statLabel}>Пользователей</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>50+</Text>
                            <Text style={styles.statLabel}>Заведений</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>⭐ 4.8</Text>
                            <Text style={styles.statLabel}>Рейтинг</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/business/register')}
                >
                    <Text style={styles.primaryButtonText}>🚀 Начать регистрацию</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.secondaryButtonText}>Возможно, позже</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    closeButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
    },

    // Hero
    hero: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    heroIcon: {
        fontSize: 80,
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#48484A',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },

    // Sections
    featuresSection: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    processSection: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    benefitsSection: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    statsSection: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },

    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 32,
    },

    // Features
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    featureCard: {
        width: (width - 64) / 2,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    featureDescription: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Process Steps
    stepsContainer: {
        position: 'relative',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 32,
        position: 'relative',
    },
    stepNumber: {
        width: 40,
        height: 40,
        backgroundColor: '#8B1538',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        zIndex: 1,
    },
    stepNumberText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    stepContent: {
        flex: 1,
        paddingTop: 4,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 16,
        color: '#8E8E93',
        lineHeight: 22,
    },
    stepConnector: {
        position: 'absolute',
        left: 19,
        top: 40,
        width: 2,
        height: 32,
        backgroundColor: '#E5E5EA',
    },

    // Benefits
    benefitCard: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    benefitIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#15803D',
        marginBottom: 8,
    },
    benefitDescription: {
        fontSize: 16,
        color: '#166534',
        lineHeight: 22,
    },

    // Stats
    statsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B1538',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },

    // Bottom Actions
    bottomActions: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#8B1538',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '500',
    },
}); 