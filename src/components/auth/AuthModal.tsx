// src/components/auth/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// Добавлены пропсы для колбэков успеха
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
}

type ActiveTab = 'login' | 'register';

// Получаем новые пропсы
export default function AuthModal({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Оверлей
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      {/* Контейнер модалки */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-scale border-4 border-burgundy-base">

        {/* Кнопка закрытия */}
        <button
            onClick={onClose} // Используем onClose из пропсов
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Закрыть окно"
          >
            <X size={20} />
        </button>

        {/* Табы */}
        <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 ${ activeTab === 'login' ? 'text-burgundy-base border-b-2 border-burgundy-base' : 'text-gray-500 hover:text-gray-800' }`}
          >
            Вход
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 ${ activeTab === 'register' ? 'text-burgundy-base border-b-2 border-burgundy-base' : 'text-gray-500 hover:text-gray-800' }`}
          >
            Регистрация
          </button>
        </div>

        {/* Содержимое табов - передаем колбэки успеха дальше */}
        <div className="p-8 md:p-10 overflow-y-auto bg-gradient-to-b from-white via-rose-50 to-burgundy-base/10 flex-grow">
          {activeTab === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setActiveTab('register')}
              onLoginSuccess={onLoginSuccess} // Передаем пропс из Header
            />
          )}
          {activeTab === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setActiveTab('login')}
              onRegisterSuccess={onRegisterSuccess} // Передаем пропс из Header
            />
          )}
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