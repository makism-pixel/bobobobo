import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { user, isLoading, isFirstLaunch } = useAuth();

    // Показываем загрузку пока проверяем авторизацию
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#8B1538" />
            </View>
        );
    }

    // Если это первый запуск, показываем welcome экран независимо от авторизации
    if (isFirstLaunch) {
        return <Redirect href="/auth/welcome" />;
    }

    // Если пользователь не авторизован, отправляем на регистрацию
    if (!user) {
        return <Redirect href="/auth/welcome" />;
    }

    // Если пользователь авторизован, переходим в приложение
    return <Redirect href="/(tabs)" />;
} 