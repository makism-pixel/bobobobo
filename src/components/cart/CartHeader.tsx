import React from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, ArrowLeft } from 'lucide-react';

interface CartHeaderProps {
  onClearCart: () => void;
}

export default function CartHeader({ onClearCart }: CartHeaderProps) {
  return (
    // --- ИЗМЕНЕНИЯ ЗДЕСЯ ---
    // Убираем градиент, делаем фон белым, текст темным, добавляем бордер снизу
    <header className="bg-white text-gray-800 py-4 border-b border-gray-200 shadow-sm sticky top-0 z-30">
    {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- ИЗМЕНЕНИЯ ЗДЕСЯ --- */}
        <nav className="text-sm mb-2 text-gray-500">
          <Link href="/" className="hover:text-burgundy-base transition-colors">Главная</Link>
        {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}
          <ChevronRight size={16} className="inline mx-1 opacity-50" />
          <span className="font-medium text-gray-700">Корзина</span> {/* Делаем текущий пункт чуть заметнее */}
        </nav>

        <div className="flex justify-between items-center">
          {/* --- ИЗМЕНЕНИЯ ЗДЕСЯ --- */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Ваша корзина</h1>
          {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}

          <div className="flex items-center space-x-4">
             {/* --- ИЗМЕНЕНИЯ ЗДЕСЯ --- */}
             <Link href="/" className="text-sm text-gray-600 hover:text-burgundy-base hidden md:inline-flex items-center transition-colors group">
               <ArrowLeft size={16} className="mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" />
               Продолжить покупки
             </Link>
             <button
              onClick={onClearCart}
              title="Очистить корзину"
              className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100"
            >
              <Trash2 size={20} />
            </button>
            {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}
          </div>
        </div>
      </div>
    </header>
  );
}