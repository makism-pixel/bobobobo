// src/app/account/dashboard/page.tsx
import React from 'react';
import { LayoutDashboard, ShoppingBag, DollarSign, MessageSquare } from 'lucide-react';

export default function SellerDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <LayoutDashboard size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Дашборд Продавца</h1>
      </div>

      {/* Сетка со статистикой (пример) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Карточка Статистики */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingBag size={20} className="text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500">Новые Заказы</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-400">за последние 7 дней</p>
        </div>
         {/* Карточка Статистики */}
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <DollarSign size={20} className="text-green-500" />
            <h3 className="text-sm font-medium text-gray-500">Доход</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,234 €</p>
          <p className="text-xs text-gray-400">за текущий месяц</p>
        </div>
         {/* Карточка Статистики */}
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare size={20} className="text-orange-500" />
            <h3 className="text-sm font-medium text-gray-500">Сообщения</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-400">непрочитанных</p>
        </div>
         {/* Добавить еще карточку... */}
      </div>

      {/* Секция последних заказов (пример) */}
      <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Последние Заказы</h2>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
              <p className="text-sm text-gray-500">Заказ #SELLIO-12370 - Обрабатывается - 55.99 €</p>
              <p className="text-sm text-gray-500">Заказ #SELLIO-12366 - Отправлен - 120.00 €</p>
              <p className="text-sm text-gray-500">...</p>
              {/* TODO: Ссылка на страницу всех заказов */}
          </div>
      </div>

    </div>
  );
}