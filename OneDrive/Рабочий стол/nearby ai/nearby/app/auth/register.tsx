import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, isLoading } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Ошибка', 'Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        try {
            await register(email, password, name);
            // После успешной регистрации пользователь автоматически перенаправится
            // на главную страницу благодаря AuthContext и index.tsx

            // Резервное перенаправление через 200ms если автоматическое не сработает
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 200);
        } catch (error: any) {
            Alert.alert('Ошибка регистрации', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Регистрация</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>

                        {/* Title */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Создайте аккаунт</Text>
                            <Text style={styles.subtitle}>
                                Присоединяйтесь к сообществу и получайте персонализированные рекомендации
                            </Text>

                            {/* Decorative Elements */}
                            <View style={styles.decorativeElements}>
                                <View style={styles.floatingEmoji1}>
                                    <Text style={styles.floatingEmojiText}>🎉</Text>
                                </View>
                                <View style={styles.floatingEmoji2}>
                                    <Text style={styles.floatingEmojiText}>✨</Text>
                                </View>
                                <View style={styles.floatingEmoji3}>
                                    <Text style={styles.floatingEmojiText}>🚀</Text>
                                </View>
                            </View>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>👤 Имя</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Как вас зовут?"
                                    placeholderTextColor="#8E8E93"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>📧 Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="your@email.com"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>🔒 Пароль</Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Минимум 6 символов"
                                    placeholderTextColor="#8E8E93"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>🔐 Подтвердите пароль</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Повторите пароль"
                                    placeholderTextColor="#8E8E93"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? '🔄 Создаём аккаунт...' : '🎯 Создать аккаунт'}
                            </Text>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            Создавая аккаунт, вы соглашаетесь с нашими{' '}
                            <Text style={styles.termsLink}>Условиями использования</Text>
                            {' '}и{' '}
                            <Text style={styles.termsLink}>Политикой конфиденциальности</Text>
                        </Text>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>или</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>📱</Text>
                                <Text style={styles.socialText}>Продолжить с телефоном</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>🔍</Text>
                                <Text style={styles.socialText}>Продолжить с Google</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginSection}>
                            <Text style={styles.loginText}>Уже есть аккаунт? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={styles.loginLink}>🔑 Войти</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 18,
        color: '#1D1D1F',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    placeholder: {
        width: 40,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    titleSection: {
        marginBottom: 40,
        position: 'relative',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#48484A',
        lineHeight: 22,
    },

    // Decorative Elements
    decorativeElements: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100,
        height: 80,
    },
    floatingEmoji1: {
        position: 'absolute',
        top: 0,
        right: 20,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingEmoji2: {
        position: 'absolute',
        top: 25,
        right: 45,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingEmoji3: {
        position: 'absolute',
        top: 50,
        right: 15,
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingEmojiText: {
        fontSize: 16,
    },

    // Form
    form: {
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1D1D1F',
    },

    // Register Button
    registerButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonDisabled: {
        backgroundColor: '#8E8E93',
        shadowOpacity: 0,
        elevation: 0,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Terms
    termsText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    termsLink: {
        color: '#8B1538',
        fontWeight: '500',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5EA',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },

    // Social Buttons
    socialButtons: {
        gap: 16,
        marginBottom: 40,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    socialIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    socialText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
    },

    // Login Section
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loginText: {
        fontSize: 14,
        color: '#48484A',
    },
    loginLink: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '600',
    },
}); 