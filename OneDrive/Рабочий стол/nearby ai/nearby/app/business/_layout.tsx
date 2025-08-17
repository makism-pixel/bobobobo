import { Stack } from 'expo-router';

export default function BusinessLayout() {
    return (
        <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />

            <Stack.Screen name="photos" options={{ headerShown: false }} />
            <Stack.Screen name="menu" options={{ headerShown: false }} />
            <Stack.Screen name="reviews" options={{ headerShown: false }} />
            <Stack.Screen name="pricing" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="staff" options={{ headerShown: false }} />
            <Stack.Screen name="booking" options={{ headerShown: false }} />
            <Stack.Screen name="delivery" options={{ headerShown: false }} />
        </Stack>
    );
}
