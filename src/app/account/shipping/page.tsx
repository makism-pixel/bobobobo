// src/app/account/shipping/page.tsx
import React from 'react';
import { Truck, MapPin, Settings } from 'lucide-react';

export default function ShippingSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Truck size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Настройки Доставки</h1>
      </div>

      <p className="text-gray-600">
        Настройте способы и стоимость доставки для ваших товаров. Эти настройки будут применяться к вашим товарам при оформлении заказа покупателем.
      </p>

      {/* Секция Пакоматов */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><MapPin size={18}/>Доставка в Пакоматы</h3>
         <p className="text-xs text-gray-500">Разрешить покупателям выбирать доставку ваших товаров в пакоматы Omniva и DPD.</p>
          <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="form-checkbox rounded text-burgundy-base focus:ring-burgundy-base/50 h-4 w-4"/>
               <span className="text-sm">Разрешить доставку в пакоматы Omniva</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="form-checkbox rounded text-burgundy-base focus:ring-burgundy-base/50 h-4 w-4"/>
               <span className="text-sm">Разрешить доставку в пакоматы DPD</span>
          </label>
          {/* Возможно, настройка базовой цены или бесплатной доставки */}
          {/* <label className="block text-sm font-medium text-gray-700 mt-3">Стоимость доставки в пакомат:</label>
           <input type="number" step="0.01" className="..." placeholder="Напр., 2.99"/> € */}
       </div>

        {/* Секция Курьерской Доставки (Пример) */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Truck size={18}/>Курьерская Доставка</h3>
          <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="form-checkbox rounded text-burgundy-base focus:ring-burgundy-base/50 h-4 w-4"/>
               <span className="text-sm">Предлагать курьерскую доставку</span>
          </label>
          {/* Здесь могут быть настройки зон, цен и т.д. */}
          <p className="text-xs text-gray-500">(Настройки курьерской доставки появятся здесь)</p>
       </div>

         {/* Кнопка Сохранить - заглушка */}
        <div className="pt-3">
            <button type="button" disabled className="px-6 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm disabled:opacity-50">
               Сохранить настройки доставки (пока не работает)
            </button>
        </div>
    </div>
  );
}