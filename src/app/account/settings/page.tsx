// src/app/account/settings/page.tsx (Исправлена точка с запятой)
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { LoaderCircle, Eye, EyeOff, User, Bell, Trash2, Lock, Settings } from 'lucide-react'; // Добавили Settings на случай, если он нужен для иконки
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Состояния для формы смены пароля
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Состояния для других настроек
  const [nickname, setNickname] = useState('');
  const [isNicknameLoading, setIsNicknameLoading] = useState(false);
  const [nicknameSuccess, setNicknameSuccess] = useState('');
  const [nicknameError, setNicknameError] = useState('');


   useEffect(() => { if (user?.user_metadata?.nickname) { setNickname(user.user_metadata.nickname); } }, [user]);

  // Обработчик смены пароля
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    if (newPassword !== confirmNewPassword) { setPasswordError('Новые пароли не совпадают.'); return; }
    if (newPassword.length < 6) { setPasswordError('Пароль должен быть не менее 6 символов.'); return; }
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setPasswordError(error.message); }
      else { setPasswordSuccess('Пароль успешно изменен!'); setNewPassword(''); setConfirmNewPassword(''); }
    } catch (err) { setPasswordError('Произошла ошибка при смене пароля.'); console.error(err); }
    finally { setIsPasswordLoading(false); }
  };

   // Обработчик смены никнейма
   const handleChangeNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setNicknameError(''); setNicknameSuccess('');
    if (!nickname.trim()) { setNicknameError('Никнейм не может быть пустым.'); return; }
    setIsNicknameLoading(true);
     try {
       const { data, error } = await supabase.auth.updateUser({ data: { nickname: nickname.trim() } });
       if (error) { setNicknameError(error.message); }
       else { setNicknameSuccess('Никнейм успешно сохранен!'); console.log('User metadata updated:', data.user?.user_metadata); }
     } catch (err) { setNicknameError('Ошибка сохранения никнейма.'); console.error(err); }
     finally { setIsNicknameLoading(false); }
   };

  // Заглушка для удаления аккаунта
  const handleDeleteAccount = () => {
      if(window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо!')) {
          alert('Логика удаления аккаунта пока не реализована.');
      }
  }; // <--- ДОБАВЛЕНА ТОЧКА С ЗАПЯТОЙ

  // Состояния загрузки/отсутствия пользователя
  if (loading) { return ( <div className="flex justify-center items-center p-10"><LoaderCircle size={32} className="animate-spin text-burgundy-base" /></div> ); }
  if (!user) { return <p className="text-center text-red-500 p-10">Ошибка: Пользователь не найден. Попробуйте перезайти.</p>; } // Улучшил сообщение

  // Если пользователь есть, показываем контент
  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 border-b pb-4">Настройки Аккаунта</h1>

      {/* --- 1. Информация о пользователе --- */}
      <section className="space-y-4">
         <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2"><User size={20}/>Профиль</h2>
          <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Email нельзя изменить через настройки.</p>
          </div>
           <form onSubmit={handleChangeNickname} className="space-y-2">
               <label htmlFor="nickname" className="block text-sm font-medium text-gray-500">Никнейм</label>
               <div className="flex items-center gap-3">
                 <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="Ваш публичный никнейм" disabled={isNicknameLoading} />
                 <button type="submit" disabled={isNicknameLoading} className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm disabled:opacity-60"> {isNicknameLoading ? '...' : 'Сохранить'} </button>
               </div>
                 {nicknameError && <p className="text-xs text-red-500 mt-1">{nicknameError}</p>}
                 {nicknameSuccess && <p className="text-xs text-green-600 mt-1">{nicknameSuccess}</p>}
           </form>
      </section>
      <hr className="border-gray-200"/>

      {/* --- 2. Смена Пароля --- */}
      <section className="space-y-4">
        {/* Используем Lock или Settings иконку */}
        <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2"><Lock size={20}/>Сменить пароль</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
           <div>
             <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
             <div className="relative">
               <input id="new-password" type={passwordVisible ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-burgundy-base focus:border-burgundy-base sm:text-sm" placeholder="••••••••" disabled={isPasswordLoading} />
               <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-burgundy-base" aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}> {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />} </button>
             </div>
           </div>
           <div>
             <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Подтвердите новый пароль</label>
             <div className="relative">
               <input id="confirm-new-password" type={confirmPasswordVisible ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className={`w-full pr-10 pl-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${passwordError && newPassword !== confirmNewPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-burgundy-base focus:border-burgundy-base'}`} placeholder="••••••••" disabled={isPasswordLoading} />
                <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-burgundy-base" aria-label={confirmPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}> {confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />} </button>
             </div>
             {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
             {passwordSuccess && <p className="text-xs text-green-600 mt-1">{passwordSuccess}</p>}
           </div>
            <button type="submit" disabled={isPasswordLoading} className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-lg shadow-sm disabled:opacity-60"> {isPasswordLoading ? 'Сохранение...' : 'Сменить пароль'} </button>
        </form>
      </section>
       <hr className="border-gray-200"/>

       {/* --- 3. Настройки Уведомлений (Пример) --- */}
       <section className="space-y-4">
         <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2"><Bell size={20}/>Уведомления</h2>
         <div className="space-y-2 text-sm text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="form-checkbox rounded text-burgundy-base focus:ring-burgundy-base/50"/><span>Получать новости и акции Sellio на Email</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="form-checkbox rounded text-burgundy-base focus:ring-burgundy-base/50"/><span>Уведомлять об изменении статуса заказа</span></label>
            <button disabled className="mt-2 px-4 py-1.5 text-xs font-medium text-white bg-brand-blue hover:bg-brand-blue-light rounded-md shadow-sm disabled:opacity-60">Сохранить настройки (пока не работает)</button>
         </div>
       </section>
        <hr className="border-gray-200"/>

       {/* --- 4. Опасная Зона (Пример) --- */}
       <section className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
         <h2 className="text-xl font-medium text-red-800 flex items-center gap-2"><Trash2 size={20}/>Опасная зона</h2>
         <p className="text-sm text-red-700">Удаление аккаунта приведет к необратимой потере всех ваших данных, включая историю заказов.</p>
          <button onClick={handleDeleteAccount} className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm">Удалить мой аккаунт</button>
       </section>
    </div>
  );
}