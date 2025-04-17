import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function EmptyCart() {
  return (
    // --- ИЗМЕНЕНИЯ ЗДЕСЯ ---
    // Градиентный фон как у основной страницы, темный текст
    <div className="bg-gradient-to-b from-white via-rose-50 to-burgundy-base/20 min-h-screen text-gray-900 flex flex-col items-center justify-center text-center p-8 font-sans">
       {/* Можно добавить CartHeader, если он нужен и на пустой странице */}
       {/* <CartHeader onClearCart={() => {}} /> */} {/* Пример */}
       <div className="flex flex-col items-center max-w-md w-full mt-[-5vh]"> {/* Сдвигаем чуть выше */}
             {/* Иконка бордовая */}
            <ShoppingBag size={72} className="text-burgundy-base opacity-50 mb-8" strokeWidth={1.5}/>
            <h1 className="text-3xl font-bold mb-4 tracking-tight text-gray-900">Ваша корзина пуста</h1>
            <p className="text-gray-600 mb-10 leading-relaxed">
                Похоже, вы еще ничего не добавили. <br/> Исследуйте наш каталог и найдите что-то для себя!
            </p>
            {/* Кнопка бордовая */}
            <Link href="/">
                <button className="px-10 py-3 bg-burgundy-base hover:bg-burgundy-light border border-transparent text-white font-semibold rounded-lg shadow-button transition-colors duration-300 ease-in-out transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burgundy-lighter focus-visible:ring-offset-white">
                    Начать покупки
                </button>
            </Link>
       </div>
    </div>
     // --- КОНЕЦ ИЗМЕНЕНИЙ ---
  );
}