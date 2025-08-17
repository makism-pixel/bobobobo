import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AirbnbTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1D1D1F',
    border: '#E5E5EA',
    notification: '#8B1538',
    primary: '#8B1538',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <ThemeProvider value={AirbnbTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="place/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
              <Stack.Screen name="business/welcome" options={{ headerShown: false }} />
              <Stack.Screen name="business/register" options={{ headerShown: false }} />
              <Stack.Screen name="business/dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="business/edit" options={{ headerShown: false }} />
              <Stack.Screen name="business/photos" options={{ headerShown: false }} />
              <Stack.Screen name="business/reviews" options={{ headerShown: false }} />
              <Stack.Screen name="business/staff" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
          </ThemeProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
