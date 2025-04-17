// src/lib/supabase/client.ts (Клиент для КЛИЕНТСКИХ Компонентов)
import { createBrowserClient } from '@supabase/ssr';

// Создаем клиент Supabase для использования в браузере (в компонентах с 'use client')
// Он читает переменные окружения, которые доступны на клиенте (начинаются с NEXT_PUBLIC_)
export const supabase = createBrowserClient(
  // process.env.NEXT_PUBLIC_SUPABASE_URL - так Next.js передает переменную из .env.local в клиентский код
  // Восклицательный знак (!) говорит TypeScript, что мы уверены, что эта переменная там есть
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Пояснение:
// 1. Мы импортируем createBrowserClient из @supabase/ssr.
// 2. Мы вызываем эту функцию, передавая ей URL и Anon Key.
// 3. URL и Anon Key мы читаем из process.env.NEXT_PUBLIC_... - это стандартный способ
//    доступа к переменным окружения из .env.local в клиентском коде Next.js.
// 4. Мы экспортируем созданный клиент как константу 'supabase', чтобы другие
//    файлы могли его импортировать (например: import { supabase } from '@/lib/supabase/client';)