// src/components/Header/index.tsx (ПОЛНАЯ ПРОВЕРЕННАЯ ВЕРСИЯ)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, LogOut, Heart, ChevronDown, Briefcase } from 'lucide-react'; // Используем Lucide
import AuthModal from '../auth/AuthModal';
import styles from './Header.module.css'; // Твои CSS Modules
import { supabase } from '@/lib/supabase/client'; // Клиент из @supabase/ssr
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const businessMenuRef = useRef<HTMLDivElement>(null);
  const cartItemCount = 3; // Пример

  // Эффект для получения сессии и подписки
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      setLoading(true); // Начинаем загрузку
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (isMounted) {
          console.log("Header: Initial user fetch:", currentUser);
          setUser(currentUser ?? null);
        }
      } catch (error) { console.error("Header: Error fetching user:", error); }
      finally { if (isMounted) { setLoading(false); } }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       if (isMounted) {
          console.log("Header: Auth state changed!", event, session);
          setUser(session?.user ?? null);
          if (loading) setLoading(false); // Убираем загрузку, если она еще была
       }
    });

    return () => {
      isMounted = false;
      if (authListener?.subscription) { authListener.subscription.unsubscribe(); }
    };
  }, []); // Пустой массив зависимостей

  // Эффект для закрытия меню "Для Бизнеса"
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (isBusinessMenuOpen && businessMenuRef.current && !businessMenuRef.current.contains(event.target as Node)) { setIsBusinessMenuOpen(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isBusinessMenuOpen]);

  // Обработчики
  const handleLogout = async () => { try { await supabase.auth.signOut(); } catch (error) { console.error("Sign Out Error:", error); } };
  const closeModal = () => { setIsAuthModalOpen(false); };
  const handleSuccess = () => { closeModal(); }; // Можно добавить логику, если нужно

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>Sellio</Link>

          {/* Поиск */}
          <div className={styles.searchContainer}>
            <Search size={18} strokeWidth={2} className={styles.searchIcon} />
            <input type="text" placeholder="Поиск товаров..." className={styles.searchInput} />
          </div>

          {/* Навигация */}
          <nav className={styles.nav}>

             {/* Меню "Для Бизнеса" */}
             <div className="relative" ref={businessMenuRef}>
                <button
                    onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
                    className={`${styles.navItem} flex items-center`}
                    aria-haspopup="true"
                    aria-expanded={isBusinessMenuOpen}
                >
                    <Briefcase size={20} strokeWidth={2} className={styles.navIcon} />
                    <span className={`${styles.navLabel} mr-1`}>Для Бизнеса</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 mt-px ${isBusinessMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isBusinessMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 py-1 animate-fade-in-down-fast">
                         <Link href="/sell-on-sellio" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setIsBusinessMenuOpen(false)}>Стать Продавцом</Link>
                         <Link href="/pickup-point-partner" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setIsBusinessMenuOpen(false)}>Открыть Пункт Выдачи</Link>
                         <Link href="/creator-program" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setIsBusinessMenuOpen(false)}>Программа Креаторов</Link>
                    </div>
                 )}
             </div>

             {/* Избранное */}
             <Link href="/favorites" className={styles.navItem} aria-label="Избранное">
                <Heart size={20} strokeWidth={2} className={styles.navIcon} />
                <span className={styles.navLabel}>Избранное</span>
             </Link>

             {/* Корзина */}
             <Link href="/cart" className={styles.navItem} aria-label="Корзина">
                <div className={styles.cartContainer}>
                   <ShoppingCart size={20} strokeWidth={2} className={styles.navIcon} />
                   {cartItemCount > 0 && (<span className={styles.cartBadge}>{cartItemCount}</span>)}
                 </div>
                <span className={styles.navLabel}>Корзина</span>
             </Link>

             {/* Вход / Профиль / Выход */}
             {loading ? (
               <div className={styles.navItem}>
                   <span className="text-xs text-gray-400 animate-pulse">Загрузка...</span>
               </div>
             ) : user ? (
               <>
                 <Link href="/account" className={styles.navItem} aria-label="Профиль">
                   <User size={20} strokeWidth={2} className={styles.navIcon} />
                   <span className={styles.navLabel}>Профиль</span>
                 </Link>
                 <button onClick={handleLogout} className={styles.navItem} aria-label="Выйти">
                   <LogOut size={20} strokeWidth={2} className={styles.navIcon} />
                   <span className={styles.navLabel}>Выйти</span>
                 </button>
               </>
             ) : (
               <button onClick={() => setIsAuthModalOpen(true)} className={styles.navItem} aria-label="Войти или зарегистрироваться">
                 <User size={20} strokeWidth={2} className={styles.navIcon} />
                 <span className={styles.navLabel}>Войти</span>
               </button>
             )}
          </nav>
        </div>
      </header>

       {/* Модальное окно AuthModal */}
       {/* Передаем только onClose */}
       {isAuthModalOpen && !user && !loading && (
         <AuthModal
           isOpen={isAuthModalOpen}
           onClose={closeModal}
           // onLoginSuccess/onRegisterSuccess больше не нужны здесь,
           // так как onAuthStateChange в этом компоненте сам обновит user
           onLoginSuccess={closeModal} // Просто закрываем
           onRegisterSuccess={closeModal} // Просто закрываем
         />
       )}

        {/* Анимация для меню */}
        <style jsx>{`
          @keyframes fadeInDownFast { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-down-fast { animation: fadeInDownFast 0.2s ease-out forwards; }
        `}</style>
    </>
  );
}