// src/app/account/page.tsx
import React from 'react';

export default function AccountPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Обзор Аккаунта</h1>
      <p className="text-gray-600">
        Добро пожаловать в ваш личный кабинет! {/* Замени [Имя Пользователя] позже */}
      </p>
      <p className="mt-4 text-gray-600">
        Здесь вы можете управлять вашей личной информацией, адресами, заказами и настройками.
        Используйте меню слева для навигации по разделам.
      </p>
      {/* В будущем здесь может быть дашборд с краткой информацией */}
    </div>
  );
}