// src/app/account/promotions/page.tsx
import React from 'react';
import { Tag, PlusCircle, Percent } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Tag size={28} className="text-burgundy-base" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Акции и Скидки</h1>
        </div>
         {/* Кнопка-заглушка */}
        <button className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm flex items-center gap-2">
            <PlusCircle size={16}/> Создать акцию
        </button>
      </div>

       <p className="text-gray-600">
        Создавайте и управляйте промокодами или скидками на ваши товары.
      </p>

        {/* Список акций - Заглушка */}
       <div className="space-y-4">
         {/* Пример акции 1 */}
         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center">
            <div>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Percent size={16} className="text-green-600"/>Скидка 10% на все платья</p>
                <p className="text-xs text-gray-500 mt-1">Действует до: 30.04.2025 | Статус: Активна</p>
            </div>
            <div>
                <button className="text-xs text-blue-600 hover:underline">Ред.</button>
                <button className="text-xs text-red-600 hover:underline ml-3">Откл.</button>
            </div>
         </div>
          {/* Пример акции 2 */}
         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center opacity-60">
            <div>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Tag size={16} className="text-gray-500"/>Промокод VESNA25</p>
                <p className="text-xs text-gray-500 mt-1">Действовал до: 31.03.2025 | Статус: Завершена</p>
            </div>
             <div>
                {/* <button className="text-xs text-blue-600 hover:underline">Статистика</button> */}
            </div>
         </div>
         <p className="text-center text-gray-400 text-sm pt-2">Здесь будет список ваших акций.</p>
       </div>
        {/* TODO: Реализовать создание и управление акциями */}
    </div>
  );
}