// src/app/account/products/page.tsx
import React from 'react';
import { Package, PlusCircle } from 'lucide-react';

export default function AccountProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-burgundy-base" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Мои Товары</h1>
        </div>
        {/* Кнопка-заглушка */}
        <button className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm flex items-center gap-2">
            <PlusCircle size={16}/> Добавить товар
        </button>
      </div>

      <p className="text-gray-600">
        Здесь вы можете управлять своими товарами: добавлять новые, редактировать существующие, следить за остатками и статусами.
      </p>

      {/* Таблица-заглушка */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Изобр.</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Название</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Цена</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Остаток</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Статус</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Пример строки (повторить несколько раз или добавить сообщение "Нет товаров") */}
            <tr>
              <td className="px-4 py-2"><div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="px-4 py-2 text-gray-700">Бордовое Платье (Пример)</td>
              <td className="px-4 py-2 text-gray-900 font-medium">40.00 €</td>
              <td className="px-4 py-2 text-gray-700">5 шт.</td>
              <td className="px-4 py-2"><span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Активен</span></td>
              <td className="px-4 py-2"><button className="text-xs text-blue-600 hover:underline">Ред.</button> <button className="text-xs text-red-600 hover:underline ml-2">Удал.</button></td>
            </tr>
            <tr>
              <td className="px-4 py-2"><div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div></td>
              <td className="px-4 py-2 text-gray-700">Туфли (Пример)</td>
              <td className="px-4 py-2 text-gray-900 font-medium">75.00 €</td>
              <td className="px-4 py-2 text-gray-700">0 шт.</td>
              <td className="px-4 py-2"><span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Скрыт</span></td>
              <td className="px-4 py-2"><button className="text-xs text-blue-600 hover:underline">Ред.</button> <button className="text-xs text-red-600 hover:underline ml-2">Удал.</button></td>
            </tr>
             {/* ... другие строки ... */}
          </tbody>
        </table>
      </div>
      {/* TODO: Добавить пагинацию */}
    </div>
  );
}