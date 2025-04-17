// src/app/account/store-settings/page.tsx
import React from 'react';
import { Store } from 'lucide-react';

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Store size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Настройки Магазина</h1>
      </div>

       <form className="space-y-5 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div>
                <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-1">Название магазина</label>
                <input id="store-name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="Название вашего магазина"/>
            </div>
             <div>
                <label htmlFor="store-description" className="block text-sm font-medium text-gray-700 mb-1">Описание магазина</label>
                <textarea id="store-description" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="Расскажите о вашем магазине"></textarea>
            </div>
            {/* Заглушки для загрузки лого/баннера */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Логотип</label>
                <button type="button" className="text-xs px-3 py-1.5 border border-dashed rounded hover:border-gray-400 text-gray-600">Загрузить лого</button>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Баннер</label>
                <button type="button" className="text-xs px-3 py-1.5 border border-dashed rounded hover:border-gray-400 text-gray-600">Загрузить баннер</button>
            </div>

             <div className="pt-3">
               <button type="submit" disabled className="px-6 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm disabled:opacity-50">
                   Сохранить изменения (пока не работает)
               </button>
             </div>
       </form>
    </div>
  );
}