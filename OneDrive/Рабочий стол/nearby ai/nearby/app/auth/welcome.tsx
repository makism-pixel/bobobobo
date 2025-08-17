import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoEmoji}>📍</Text>
                    </View>
                    <Text style={styles.logoText}>Nearby AI</Text>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <View style={styles.heroSection}>
                    <Text style={styles.title}>Добро пожаловать!</Text>
                    <Text style={styles.subtitle}>
                        Откройте для себя лучшие места рядом с вами с помощью искусственного интеллекта
                    </Text>
                </View>

                {/* Illustration */}
                <View style={styles.illustration}>
                    <View style={styles.illustrationBg}>
                        <Text style={styles.illustrationEmoji}>🗺️</Text>
                        <View style={styles.floatingIcon1}>
                            <Text style={styles.floatingEmoji}>☕</Text>
                        </View>
                        <View style={styles.floatingIcon2}>
                            <Text style={styles.floatingEmoji}>🍕</Text>
                        </View>
                        <View style={styles.floatingIcon3}>
                            <Text style={styles.floatingEmoji}>🛍️</Text>
                        </View>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>🤖</Text>
                        </View>
                        <Text style={styles.featureText}>AI рекомендации</Text>
                    </View>
                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>⚡</Text>
                        </View>
                        <Text style={styles.featureText}>Быстрый поиск</Text>
                    </View>
                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>❤️</Text>
                        </View>
                        <Text style={styles.featureText}>Избранное</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/auth/register')}
                >
                    <Text style={styles.primaryButtonText}>Создать аккаунт</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.secondaryButtonText}>Войти</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Text style={styles.skipButtonText}>Продолжить без регистрации</Text>
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
        paddingTop: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        backgroundColor: '#8B1538',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoEmoji: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    logoText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B1538',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#48484A',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },

    // Illustration
    illustration: {
        alignItems: 'center',
        marginVertical: 40,
    },
    illustrationBg: {
        width: 180,
        height: 180,
        backgroundColor: '#F8F9FA',
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    illustrationEmoji: {
        fontSize: 64,
    },
    floatingIcon1: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    floatingIcon2: {
        position: 'absolute',
        bottom: 30,
        left: 15,
        width: 32,
        height: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    floatingIcon3: {
        position: 'absolute',
        bottom: 15,
        right: 25,
        width: 28,
        height: 28,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    floatingEmoji: {
        fontSize: 16,
    },

    // Features
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    feature: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#F8F9FA',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    featureEmoji: {
        fontSize: 20,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#48484A',
        textAlign: 'center',
    },

    // Actions
    actions: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#8B1538',
        fontSize: 16,
        fontWeight: '700',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
}); 