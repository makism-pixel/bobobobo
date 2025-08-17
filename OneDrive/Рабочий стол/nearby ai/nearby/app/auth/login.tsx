import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, resetPassword, isLoading } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        try {
            await login(email, password);
            // После успешного входа пользователь автоматически перенаправится
            // благодаря AuthContext и index.tsx

            // Резервное перенаправление через 200ms если автоматическое не сработает
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 200);
        } catch (error: any) {
            Alert.alert('Ошибка входа', error.message);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Введите email', 'Пожалуйста, введите ваш email для сброса пароля');
            return;
        }

        try {
            await resetPassword(email);
            Alert.alert(
                'Письмо отправлено',
                'Проверьте вашу почту для сброса пароля',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            Alert.alert('Ошибка', error.message);
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
                        <Text style={styles.headerTitle}>Вход</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>

                        {/* Title */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>С возвращением!</Text>
                            <Text style={styles.subtitle}>
                                Войдите в свой аккаунт, чтобы получить персонализированные рекомендации
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
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
                                    placeholder="Введите пароль"
                                    placeholderTextColor="#8E8E93"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                                <Text style={styles.forgotText}>🔑 Забыли пароль?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? '🔄 Входим...' : '🎯 Войти'}
                            </Text>
                        </TouchableOpacity>

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

                        {/* Register Link */}
                        <View style={styles.registerSection}>
                            <Text style={styles.registerText}>Нет аккаунта? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.registerLink}>📝 Зарегистрироваться</Text>
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

    // Form
    form: {
        marginBottom: 32,
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
    forgotButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
    },
    forgotText: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '500',
    },

    // Login Button
    loginButton: {
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
    loginButtonDisabled: {
        backgroundColor: '#8E8E93',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
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

    // Register Section
    registerSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    registerText: {
        fontSize: 14,
        color: '#48484A',
    },
    registerLink: {
        fontSize: 14,
        color: '#8B1538',
        fontWeight: '600',
    },
}); 