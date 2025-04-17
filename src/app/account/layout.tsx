// src/app/account/layout.tsx (КЛИЕНТСКАЯ ЗАЩИТА РОУТА)
'use client'; // <--- ОБЯЗАТЕЛЬНО 'use client'

import React, { useEffect } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import { useAuth } from '@/context/AuthContext'; // <--- Используем наш контекст
import { useRouter } from 'next/navigation'; // <--- Для редиректа
import { LoaderCircle } from 'lucide-react'; // <--- Для индикатора загрузки

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); // Получаем пользователя и статус загрузки из КОНТЕКСТА
  const router = useRouter();

  // Логика редиректа
  useEffect(() => {
    // Ждем окончания загрузки информации о пользователе
    if (!loading) {
      // Если загрузка завершена и пользователя НЕТ
      if (!user) {
        console.log("AccountLayout: No user found after loading, redirecting to /");
        router.replace('/'); // Используем replace, чтобы не добавлять в историю браузера
      } else {
        console.log("AccountLayout: User found, access allowed.");
      }
    }
  }, [user, loading, router]); // Зависимости: user, loading, router

  // Пока идет первоначальная загрузка из AuthContext, показываем спиннер
  if (loading) {
     console.log("AccountLayout: Showing loading spinner...");
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <LoaderCircle size={48} className="animate-spin text-burgundy-base" />
        </div>
     );
  }

  // Если загрузка завершена, но пользователя НЕТ (редирект еще не сработал)
  // Показываем спиннер, чтобы избежать мелькания контента перед редиректом
  if (!user) {
      console.log("AccountLayout: No user after loading, rendering spinner while redirect happens.");
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <LoaderCircle size={48} className="animate-spin text-burgundy-base" />
        </div>
     );
  }

  // Если загрузка завершена и пользователь ЕСТЬ, показываем макет ЛК
  console.log("AccountLayout: Rendering account content for user:", user.id);
  return (
    <div className="bg-gradient-to-b from-white via-rose-50 to-burgundy-base/20 min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1"><AccountSidebar /></aside>
          {/* Блок контента с бордовой рамкой */}
          <section className="md:col-span-3"><div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-burgundy-base/50">{children}</div></section>
        </div>
      </div>
    </div>
  );
}