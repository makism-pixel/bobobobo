// src/components/ui/InfoModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // Сюда будет передаваться контент (текст)
}

export default function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
  if (!isOpen) return null;

  // Закрытие по клику на оверлей
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Предотвращаем прокрутку фона при открытой модалке
  React.useEffect(() => {
     if (isOpen) {
       document.body.style.overflow = 'hidden';
     } else {
       document.body.style.overflow = 'unset';
     }
     // Очистка при размонтировании
     return () => {
       document.body.style.overflow = 'unset';
     };
  }, [isOpen]);


  return (
    // Оверлей
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      {/* Контейнер модалки */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-scale border-4 border-burgundy-base">

        {/* Заголовок и кнопка закрытия */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Закрыть окно"
          >
            <X size={20} />
          </button>
        </div>

        {/* Контентная область с прокруткой */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow">
           {/* Просто рендерим children, предполагая, что это уже размеченный JSX */}
           {/* Для лучшего форматирования можно использовать @tailwindcss/typography и класс prose */}
           <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
             {children}
           </div>
        </div>

      </div>
       {/* Анимация */}
       <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}