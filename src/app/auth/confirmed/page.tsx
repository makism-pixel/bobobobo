// src/app/auth/confirmed/page.tsx (Финальная стилизованная версия)
import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // Иконка успеха

export default function AuthConfirmedPage() {
  return (
    // Градиентный фон
    <div className="bg-gradient-to-b from-white via-rose-50 to-burgundy-base/20 min-h-screen flex items-center justify-center px-4 py-12">
      {/* Карточка */}
      <div className="bg-white p-10 md:p-12 rounded-xl shadow-subtle border border-burgundy-base/50 max-w-md w-full text-center">

        {/* Иконка */}
        <CheckCircle strokeWidth={1.5} size={72} className="mx-auto text-green-500 mb-8" />

        {/* Заголовок */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
          Email подтвержден!
        </h1>

        {/* Текст */}
        <p className="text-base text-gray-600 mb-10 leading-relaxed">
          Ваш аккаунт Sellio успешно активирован. Теперь вы можете войти в систему или перейти на главную страницу.
        </p>

        {/* Кнопка */}
        <Link href="/" className="inline-block">
          <button className="w-full sm:w-auto px-10 py-3 bg-brand-blue hover:bg-brand-blue-light border border-transparent text-white font-semibold rounded-lg shadow-button transition-colors duration-300 ease-in-out transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue focus-visible:ring-offset-white">
            Перейти на главную
          </button>
        </Link>
      </div>
    </div>
  );
}