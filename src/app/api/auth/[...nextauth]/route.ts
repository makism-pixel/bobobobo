// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // <--- Импортируем CredentialsProvider
import { supabase } from "@/lib/supabase/client"; // <--- Импортируем НАШ КЛИЕНТСКИЙ клиент Supabase

export const authOptions: AuthOptions = {
  providers: [
    // --- ДОБАВЛЯЕМ ПРОВАЙДЕРА ДЛЯ EMAIL/ПАРОЛЯ ---
    CredentialsProvider({
      // Имя провайдера (отображается на стандартной странице входа NextAuth, если используется)
      name: "Email и Пароль",
      // Определяем поля, которые ожидаем от формы входа
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Пароль", type: "password" }
      },
      // --- САМАЯ ВАЖНАЯ ЧАСТЬ: Функция проверки ---
      async authorize(credentials, req) {
        // credentials содержит email и password из формы
        if (!credentials?.email || !credentials.password) {
          console.error("Auth.js: Missing email or password in credentials");
          return null; // Не хватает данных
        }

        console.log("Auth.js: Authorize attempt for:", credentials.email);

        try {
          // Используем клиент Supabase для проверки пароля
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (signInError) {
            // Ошибка от Supabase (неверный логин/пароль, пользователь не найден и т.д.)
            console.error("Auth.js: Supabase Sign In Error:", signInError.message);
            // НЕ возвращаем ошибку напрямую, возвращаем null, чтобы NextAuth показал стандартную ошибку
            // Можно выбросить ошибку: throw new Error(signInError.message); тогда NextAuth покажет ее
            return null;
          }

          if (data?.user) {
            // Успех! Supabase вернул пользователя
            console.log("Auth.js: Supabase Sign In Success. User ID:", data.user.id);
            // Возвращаем объект пользователя (или его часть) для NextAuth
            // NextAuth сохранит эту информацию (обычно id/email/name) в JWT/сессии
            return {
              id: data.user.id,
              email: data.user.email,
              // Можно добавить другие поля, если они есть в data.user или ты их получишь отдельно
              // name: data.user.user_metadata?.nickname,
              // role: data.user.user_metadata?.app_role,
            };
          }

          // Если Supabase не вернул ни ошибку, ни пользователя (маловероятно)
          console.error("Auth.js: Supabase returned no error and no user.");
          return null;

        } catch (error) {
          // Любая другая ошибка при вызове Supabase
          console.error("Auth.js: Error during Supabase sign in call:", error);
          return null;
        }
      }
    })
    // --- КОНЕЦ CredentialsProvider ---

    // Здесь можно добавить других провайдеров, например, Google
    // GoogleProvider({ ... })
  ],

  secret: process.env.NEXTAUTH_SECRET, // Секрет остается

  session: { // Стратегия сессии остается JWT
    strategy: "jwt",
  },

  // Добавим колбэки, чтобы ID пользователя попадал в сессию и JWT
  callbacks: {
    async jwt({ token, user }) {
      // При первом входе (когда user объект доступен из authorize) добавляем ID в токен
      if (user) {
        token.id = user.id;
         // Можно добавить и другие данные из authorize, если они там возвращались
        // token.role = user.role;
      }
      return token; // Возвращаем токен (он будет зашифрован)
    },
    async session({ session, token }) {
      // Добавляем данные из токена в объект сессии, который будет доступен на клиенте
      if (token && session.user) {
        session.user.id = token.id as string; // Добавляем ID
        // session.user.role = token.role; // Пример добавления роли
      }
      return session; // Возвращаем дополненную сессию
    },
  },

  // Можно указать кастомную страницу входа, если стандартная не устраивает
  // pages: {
  //   signIn: '/login',
  // }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };