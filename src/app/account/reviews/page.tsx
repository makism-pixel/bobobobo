// src/app/account/reviews/page.tsx
import React from 'react';
import { Star, MessageCircle } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Star size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Отзывы Покупателей</h1>
      </div>

      <p className="text-gray-600">
        Просмотр отзывов, оставленных покупателями на ваши товары или магазин.
      </p>

      {/* Фильтры/Сортировка - Заглушка */}
      <div className="text-sm text-gray-500">Фильтры (по товару, по оценке) будут здесь.</div>


       {/* Список отзывов - Заглушка */}
       <div className="space-y-4">
         {/* Пример отзыва 1 */}
         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
               <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                  <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                  <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                  <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                  <Star size={14} className="text-gray-300"/>
               </div>
               <span className="text-xs text-gray-400">16.04.2025</span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">Отзыв на товар "Винтажная Сумка"</p>
            <p className="text-sm text-gray-600 italic">"Сумка хорошая, но цвет немного отличается от фото."</p>
            <p className="text-xs text-gray-500 mt-1">От: Покупатель В.</p>
             {/* TODO: Возможность ответить на отзыв? */}
             {/* <button className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1"><MessageCircle size={14}/>Ответить</button> */}
         </div>

          {/* Пример отзыва 2 */}
           <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            {/* ... */}
             <p className="text-sm text-gray-600 italic">"Все отлично, быстрая доставка!"</p>
             {/* ... */}
           </div>

           <p className="text-center text-gray-400 text-sm">Больше отзывов будет здесь.</p>
       </div>
        {/* TODO: Пагинация */}

    </div>
  );
}