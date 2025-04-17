// src/app/account/analytics/page.tsx
import React from 'react';
import { BarChart2, TrendingUp, Eye as EyeIcon } from 'lucide-react'; // Используем EyeIcon

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <BarChart2 size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Аналитика и Статистика</h1>
      </div>

      <p className="text-gray-600">
        Обзор статистики вашего магазина: продажи, просмотры, доход и другие показатели.
      </p>

      {/* Селектор периода - Заглушка */}
      <div className="text-sm">
        <label htmlFor="period" className="mr-2">Период:</label>
        <select id="period" className="p-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base">
            <option>Последние 7 дней</option>
            <option>Этот месяц</option>
            <option>Прошлый месяц</option>
            <option>За все время</option>
        </select>
      </div>

       {/* График/Данные - Заглушка */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Обзор Продаж</h3>
           {/* TODO: Вставить график */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded flex items-center justify-center text-gray-400">
             (Здесь будет график)
          </div>
           <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                  <p className="text-xs text-gray-500">Всего Заказов</p>
                  <p className="text-xl font-bold">42</p>
              </div>
               <div>
                  <p className="text-xs text-gray-500">Общий Доход</p>
                  <p className="text-xl font-bold">2,580 €</p>
              </div>
           </div>
       </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Популярные Товары</h3>
           {/* TODO: Вставить список */}
           <p className="text-sm text-gray-500">(Список самых просматриваемых или продаваемых товаров)</p>
       </div>

       {/* TODO: Реализовать сбор и отображение статистики */}
    </div>
  );
}