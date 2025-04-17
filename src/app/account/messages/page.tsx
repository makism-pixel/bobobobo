// src/app/account/messages/page.tsx
import React from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <MessageSquare size={28} className="text-burgundy-base" />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Сообщения</h1>
      </div>

      <p className="text-gray-600">
        Общайтесь с покупателями и службой поддержки Sellio.
      </p>

      {/* Заглушка интерфейса чата/сообщений */}
      <div className="flex flex-col md:flex-row gap-4 h-[500px]"> {/* Пример высоты */}
         {/* Список чатов (слева) */}
         <div className="w-full md:w-1/3 lg:w-1/4 border border-gray-200 rounded-lg bg-white shadow-sm overflow-y-auto p-3 space-y-2">
             {/* Пример чата */}
             <div className="p-2 rounded hover:bg-gray-50 cursor-pointer border-b">
                <p className="text-sm font-medium text-gray-800">Покупатель А.</p>
                <p className="text-xs text-gray-500 truncate">Вопрос по заказу #SELLIO-12370...</p>
             </div>
             <div className="p-2 rounded hover:bg-gray-50 cursor-pointer border-b bg-blue-50"> {/* Активный? */}
                <p className="text-sm font-medium text-gray-800">Поддержка Sellio</p>
                <p className="text-xs text-gray-500 truncate">Ваш запрос на вывод средств...</p>
             </div>
              <div className="p-2 rounded hover:bg-gray-50 cursor-pointer border-b">
                <p className="text-sm font-medium text-gray-800">Покупатель В.</p>
                <p className="text-xs text-gray-500 truncate">Здравствуйте! Есть ли размер L?</p>
             </div>
             <p className="text-xs text-center text-gray-400 pt-2">...</p>
         </div>

         {/* Окно чата (справа) */}
          <div className="w-full md:w-2/3 lg:w-3/4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col">
             {/* Заголовок чата */}
             <div className="p-3 border-b font-semibold text-gray-800 flex-shrink-0">
                Поддержка Sellio
             </div>
             {/* Окно сообщений */}
             <div className="p-4 space-y-3 overflow-y-auto flex-grow bg-gray-50/50">
                 {/* Сообщения */}
                 <div className="text-xs text-gray-400 text-center">17 Апреля 2025</div>
                 <div className="p-2 rounded bg-blue-100 text-sm max-w-[80%] mr-auto">Ваш запрос на вывод средств одобрен.</div>
                 <div className="p-2 rounded bg-gray-200 text-sm max-w-[80%] ml-auto">Спасибо!</div>
                 {/* ... */}
             </div>
             {/* Поле ввода сообщения */}
              <div className="p-3 border-t bg-white flex items-center gap-2 flex-shrink-0">
                  <input type="text" placeholder="Введите сообщение..." className="flex-grow text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-burgundy-base"/>
                  <button className="p-2 text-white bg-brand-blue rounded-md hover:bg-brand-blue-light">
                      <Send size={18}/>
                  </button>
              </div>
          </div>
      </div>
       {/* TODO: Реализовать логику сообщений */}
    </div>
  );
}