import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Используем переменные окружения для безопасности
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ohnjgqyabbwbocnowjsa.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obmpncXlhYmJ3Ym9jbm93anNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODM4NjIsImV4cCI6MjA3MDg1OTg2Mn0.y1K7rIx9pecgkxxKaJQvOA_NLptf2F56pBdbHqEQkJo';

console.log('🔧 Supabase config:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});