// src/app/account/seller-orders/page.tsx
import React from 'react';
import { ShoppingBag, Filter } from 'lucide-react';

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <ShoppingBag size={28} className="text-burgundy-base" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Заказы Покупателей</h1>
        </div>
         {/* Кнопка/Фильтр - заглушка */}
         <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
            <Filter size={14}/> Фильтр
         </button>
      </div>

      <p className="text-gray-600">
        Просмотр и управление заказами, сделанными покупателями в вашем магазине.
      </p>

       {/* Таблица-заглушка */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">№ Заказа</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Дата</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Покупатель</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Сумма</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Статус</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Действия</th>
            </tr>
          </thead>
           <tbody className="divide-y divide-gray-100">
             {/* Пример строки */}
            <tr>
              <td className="px-4 py-2 text-gray-900 font-medium">SELLIO-12370</td>
              <td className="px-4 py-2 text-gray-700">15.04.2025</td>
              <td className="px-4 py-2 text-gray-700">Покупатель А.</td>
              <td className="px-4 py-2 text-gray-900 font-medium">55.99 €</td>
              <td className="px-4 py-2"><span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">В обработке</span></td>
              <td className="px-4 py-2"><button className="text-xs text-blue-600 hover:underline">Детали</button></td>
            </tr>
             {/* ... другие строки ... */}
             <tr>
              <td className="px-4 py-2 text-gray-900 font-medium">SELLIO-12366</td>
              <td className="px-4 py-2 text-gray-700">14.04.2025</td>
              <td className="px-4 py-2 text-gray-700">Покупатель Б.</td>
              <td className="px-4 py-2 text-gray-900 font-medium">120.00 €</td>
              <td className="px-4 py-2"><span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Отправлен</span></td>
              <td className="px-4 py-2"><button className="text-xs text-blue-600 hover:underline">Детали</button></td>
            </tr>
           </tbody>
        </table>
      </div>
       {/* TODO: Добавить пагинацию */}
    </div>
  );
}