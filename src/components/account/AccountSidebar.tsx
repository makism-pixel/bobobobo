// src/components/account/AccountSidebar.tsx (Динамический)
'use client'

import Link from 'next/link';
import { User, ShoppingBag, Settings, LogOut, Package, Store, MessageSquare, BarChart2, Tag, FileText, DollarSign, Truck, Star } from 'lucide-react'; // Добавили иконки
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Используем контекст
import { supabase } from '@/lib/supabase/client'; // Для выхода

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth(); // Получаем пользователя

  // Определяем роль пользователя (из метаданных, сохраненных при регистрации)
  // Используем 'buyer' по умолчанию или если метаданные не загрузились
  const userRole = user?.user_metadata?.app_role || 'buyer';

  // Временная функция выхода
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Редирект или обновление состояния произойдет через AuthProvider/Header
    console.log("Logout initiated from Sidebar");
    // Можно добавить router.push('/') здесь, если нужно
  };

  // --- Наборы ссылок для разных ролей ---
  const baseNavItems = [
      { href: '/account', label: 'Профиль', icon: User }, // Обзор аккаунта (может быть разным для ролей)
      { href: '/account/orders', label: 'Мои Заказы', icon: ShoppingBag }, // Заказы покупателя
      { href: '/account/settings', label: 'Настройки', icon: Settings }, // Общие настройки
  ];

  const sellerNavItems = [
      { href: '/account/dashboard', label: 'Дашборд', icon: BarChart2 }, // Главная продавца
      { href: '/account/products', label: 'Мои Товары', icon: Package },
      { href: '/account/seller-orders', label: 'Заказы Покупателей', icon: ShoppingBag },
      { href: '/account/store-settings', label: 'Настройки Магазина', icon: Store },
      { href: '/account/shipping', label: 'Настройки Доставки', icon: Truck },
      { href: '/account/payouts', label: 'Финансы и Выплаты', icon: DollarSign },
      { href: '/account/reviews', label: 'Отзывы Покупателей', icon: Star },
      { href: '/account/messages', label: 'Сообщения', icon: MessageSquare },
      { href: '/account/promotions', label: 'Акции и Скидки', icon: Tag },
      { href: '/account/seller-profile', label: 'Профиль Продавца', icon: FileText },
      ...baseNavItems, // Добавляем базовые настройки в конец
  ];
  // --- Конец наборов ссылок ---


  // Выбираем нужный набор ссылок в зависимости от роли
  const navItemsToRender = userRole === 'seller' ? sellerNavItems : baseNavItems;

  // Не рендерим меню, пока идет загрузка пользователя
  if (loading) {
      return (
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 animate-pulse h-60">
              {/* Заглушка для загрузки */}
          </div>
      );
  }

  return (
      <nav className="bg-white p-4 rounded-xl shadow-md border border-burgundy-base/50 flex flex-col gap-1">
          {navItemsToRender.map((item) => {
              const isActive = (item.href === '/account' && pathname === item.href) ||
                               (item.href !== '/account' && pathname?.startsWith(item.href));
              return (
                  <Link
                      key={item.href} // Используем href как ключ
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                          isActive
                              ? 'bg-burgundy-base/10 text-burgundy-base font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      {item.label}
                  </Link>
              );
          })}
           {/* Кнопка Выхода */}
           <button
               onClick={handleLogout}
               className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4 w-full text-left"
           >
               <LogOut size={18} strokeWidth={2} />
               Выйти
           </button>
      </nav>
  );
}