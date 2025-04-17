// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Импорт клиента Supabase

// Проверяем наличие пропса onLoginSuccess
interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

// Получаем onLoginSuccess
export default function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError(signInError.message || 'Ошибка входа.');
      } else if (data?.user) {
        console.log('Supabase Sign In Successful! User:', data.user);
        onLoginSuccess(); // Вызываем колбэк при успехе
      } else {
         setError('Произошла неизвестная ошибка при входе.');
      }
    } catch (networkError) {
      console.error('Login network/supabase error:', networkError);
      setError('Ошибка сети или сервера.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Вход в Sellio</h2>

      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}

      {/* Поле Email */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-gray-400" /></span>
          <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="you@example.com" disabled={isLoading} />
        </div>
      </div>

      {/* Поле Пароль */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
         <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></span>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="••••••••" disabled={isLoading} />
        </div>
      </div>

      {/* Ссылка "Забыли пароль?" */}
      <div className="text-right">
        <a href="#" className="text-xs text-burgundy-base hover:text-burgundy-light underline">
          Забыли пароль?
        </a>
      </div>

      {/* Синяя Кнопка "Войти" */}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
        {isLoading ? ( <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> ) : 'Войти'}
      </button>

      {/* Ссылка на регистрацию */}
      {/* --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавлен </p> --- */}
      <p className="text-center text-sm text-gray-600">
        Нет аккаунта?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-burgundy-base hover:text-burgundy-light underline"
        >
          Зарегистрироваться
        </button>
      </p> {/* <--- ЭТОТ ТЕГ БЫЛ ПРОПУЩЕН */}
      {/* --- КОНЕЦ ИСПРАВЛЕНИЯ --- */}
    </form>
  );
}