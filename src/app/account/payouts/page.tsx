// src/app/account/payouts/page.tsx
import React from 'react';
import { DollarSign, Banknote, History } from 'lucide-react';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <DollarSign size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Финансы и Выплаты</h1>
      </div>

      {/* Баланс */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Текущий Баланс</h3>
        <p className="text-3xl font-bold text-green-600">150.75 €</p>
        <p className="text-xs text-gray-500 mt-1">Доступно для выплаты</p>
        <button disabled className="mt-4 px-4 py-1.5 text-xs font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-md shadow-sm disabled:opacity-50">
          Запросить выплату (пока не работает)
        </button>
      </div>

      {/* Реквизиты */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Banknote size={18}/>Банковские Реквизиты для Выплат</h3>
         {/* TODO: Форма для ввода/отображения реквизитов */}
        <p className="text-sm text-gray-500">(Здесь будет форма для добавления или просмотра ваших банковских реквизитов)</p>
        <button disabled className="mt-3 text-xs text-blue-600 hover:underline">Редактировать реквизиты</button>
      </div>


      {/* История Выплат */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><History size={18}/>История Выплат</h3>
         {/* TODO: Таблица с историей */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="p-2 font-medium">Дата</th>
                  <th className="p-2 font-medium">Сумма</th>
                  <th className="p-2 font-medium">Статус</th>
                </tr>
              </thead>
               <tbody>
                  {/* Пример */}
                 <tr className="border-t">
                   <td className="p-2">01.04.2025</td>
                   <td className="p-2">100.00 €</td>
                   <td className="p-2 text-green-600">Выплачено</td>
                 </tr>
                 <tr className="border-t">
                   <td className="p-2">10.03.2025</td>
                   <td className="p-2">85.50 €</td>
                   <td className="p-2 text-green-600">Выплачено</td>
                 </tr>
                  {/* ... */}
               </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">(Список выплат будет здесь)</p>
      </div>
    </div>
  );
}