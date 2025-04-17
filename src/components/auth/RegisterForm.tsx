// src/components/auth/RegisterForm.tsx (ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ БЕЗ "..." и БЕЗ emailRedirectTo)
'use client';

import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Check, ShoppingBag, Store } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (!agreedToTerms) { setError('Необходимо принять условия пользовательского соглашения'); return; }

    setIsLoading(true);
    try {
      // Вызываем signUp БЕЗ опции emailRedirectTo (ДЛЯ ТЕСТА)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { nickname: nickname, app_role: role }
          // emailRedirectTo: '...' <-- УДАЛЕНО ДЛЯ ТЕСТА
        }
      });

      if (signUpError) { setError(signUpError.message || 'Ошибка регистрации.'); }
      else if (data.user && !data.session) { setIsSuccess(true); setError(''); }
      else if (data.user && data.session) { setError(''); onRegisterSuccess(); }
      else { setError('Произошла неизвестная ошибка при регистрации.'); }
    } catch (networkError) {
      console.error('Registration network/supabase error:', networkError);
      setError('Ошибка сети или сервера. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 p-4">
         <Check size={48} className="mx-auto text-green-500" />
         <h2 className="text-xl font-semibold text-gray-900">Регистрация почти завершена!</h2>
         <p className="text-sm text-gray-600">Мы отправили письмо для подтверждения на адрес <strong>{email}</strong>. Пожалуйста, перейдите по ссылке в письме, чтобы активировать ваш аккаунт и войти.</p>
         <p className="text-xs text-gray-500">(Если письмо не пришло, проверьте папку "Спам")</p>
      </div>
    );
  }

  return (
    // Используем ПОЛНЫЕ атрибуты для всех элементов
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Регистрация в Sellio</h2>

      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}

      {/* Поля Email, Никнейм, Пароль, Подтверждение - ПОЛНЫЕ АТРИБУТЫ */}
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-gray-400" /></span>
          <input id="register-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="you@example.com" disabled={isLoading} />
        </div>
      </div>
      <div>
        <label htmlFor="register-nickname" className="block text-sm font-medium text-gray-700 mb-1">Никнейм</label>
        <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon size={16} className="text-gray-400" /></span>
          <input id="register-nickname" name="nickname" type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="Ваш никнейм" disabled={isLoading} />
        </div>
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
        <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></span>
          <input id="register-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="••••••••" disabled={isLoading} />
        </div>
      </div>
      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
        <div className="relative">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></span>
          <input id="register-confirm-password" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${password !== confirmPassword && confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-burgundy-base focus:border-burgundy-base'}`} placeholder="••••••••" disabled={isLoading} />
        </div>
      </div>

      {/* Выбор роли */}
      <div>
         <span className="block text-sm font-medium text-gray-700 mb-3">Зарегистрироваться как:</span>
         <div className="grid grid-cols-2 gap-3">
           <label htmlFor="role-buyer" className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${role === 'buyer' ? 'border-burgundy-base border-2 shadow-md bg-burgundy-base/5' : 'border-gray-300 hover:border-gray-400'}`}> <input id="role-buyer" type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="sr-only" disabled={isLoading}/> <ShoppingBag size={24} className={`mb-2 ${role === 'buyer' ? 'text-burgundy-base' : 'text-gray-500'}`} /> <span className={`text-sm font-medium ${role === 'buyer' ? 'text-burgundy-base' : 'text-gray-700'}`}>Покупатель</span> </label>
           <label htmlFor="role-seller" className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${role === 'seller' ? 'border-burgundy-base border-2 shadow-md bg-burgundy-base/5' : 'border-gray-300 hover:border-gray-400'}`}> <input id="role-seller" type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} className="sr-only" disabled={isLoading}/> <Store size={24} className={`mb-2 ${role === 'seller' ? 'text-burgundy-base' : 'text-gray-500'}`} /> <span className={`text-sm font-medium ${role === 'seller' ? 'text-burgundy-base' : 'text-gray-700'}`}>Продавец</span> </label>
         </div>
         <p className="text-xs text-gray-500 mt-2 text-center">Выбор можно будет изменить позже.</p>
      </div>

      {/* Условия соглашения */}
      <div className="flex items-start">
         <div className="flex items-center h-5"><input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="focus:ring-burgundy-base h-4 w-4 text-burgundy-base border-gray-300 rounded" disabled={isLoading}/></div>
          <div className="ml-3 text-sm">
             {/* Убедись, что страницы /terms и /privacy существуют или замени их */}
            <label htmlFor="terms" className="text-gray-600"> Я принимаю <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-burgundy-base hover:text-burgundy-light underline">Условия</a> и <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-burgundy-base hover:text-burgundy-light underline">Политику конфиденциальности</a></label>
          </div>
      </div>

      {/* Синяя Кнопка "Зарегистрироваться" */}
      <button type="submit" disabled={isLoading || !agreedToTerms} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>

      {/* Ссылка на вход */}
      <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-burgundy-base hover:text-burgundy-light underline"
          >
               Войти
           </button>
      </p> {/* <--- Закрывающий тег НА МЕСТЕ */}
    </form>
  );
}