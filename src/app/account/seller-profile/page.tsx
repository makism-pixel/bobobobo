// src/app/account/seller-profile/page.tsx
import React from 'react';
import { FileText, ShieldCheck, Link as LinkIcon } from 'lucide-react'; // Используем LinkIcon

export default function SellerProfilePage() {
  return (
     <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <FileText size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Профиль Продавца</h1>
      </div>

       <p className="text-gray-600">
        Информация о вас как о продавце. Некоторые данные могут отображаться покупателям на странице вашего магазина.
      </p>

       {/* Юридическая информация */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
         <h3 className="text-lg font-semibold text-gray-800">Юридическая информация</h3>
          {/* TODO: Форма для юр. данных */}
          <p className="text-sm text-gray-500">(Здесь будет форма для ввода вашего юридического имени/названия компании, регистрационного номера, адреса и т.д.)</p>
           <button disabled className="mt-3 text-xs text-blue-600 hover:underline">Редактировать</button>
       </div>

        {/* Верификация */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-2">
         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><ShieldCheck size={18} className="text-green-600"/>Верификация</h3>
         <p className="text-sm text-green-700 font-medium">Ваш аккаунт подтвержден.</p>
         {/* Или */}
         {/* <p className="text-sm text-orange-700 font-medium">Требуется верификация.</p> */}
         {/* <button className="text-xs text-blue-600 hover:underline">Пройти верификацию</button> */}
          <p className="text-xs text-gray-500">(Статус вашей верификации как продавца)</p>
       </div>

        {/* Ссылка на публичный профиль */}
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <h3 className="text-lg font-semibold text-gray-800 mb-2">Ваш публичный магазин</h3>
         {/* TODO: Сделать ссылку динамической */}
         <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-burgundy-base hover:underline break-all flex items-center gap-1.5">
            <LinkIcon size={14}/> http://localhost:3000/store/vash-magazin
         </a>
       </div>

    </div>
  );
}