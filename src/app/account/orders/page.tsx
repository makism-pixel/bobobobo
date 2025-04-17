// src/app/account/orders/page.tsx
'use client'; // Используем клиентский компонент для примера с mock данными/загрузкой

import React, { useState, useEffect } from 'react';
import OrderCard from '@/components/account/OrderCard'; // Импорт карточки заказа
import { IOrder } from '@/types'; // Импорт типа Заказа

// --- Mock Данные Заказов (!!! ЗАМЕНИТЬ НА РЕАЛЬНУЮ ЗАГРУЗКУ !!!) ---
const mockOrders: IOrder[] = [
  {
    id: 'order123', orderNumber: 'SELLIO-12345', date: '2025-04-10T10:00:00Z', status: 'Delivered', totalAmount: 125.50,
    items: [
      { id: 'item1', productId: 1, productName: 'Элегантное Бордовое Платье...', productImage: '/images/placeholder-dress.jpg', quantity: 1, pricePerUnit: 50*(1-0.2)},
      { id: 'item2', productId: 2, productName: 'Классические Туфли...', productImage: '/images/placeholder-shoes.jpg', quantity: 1, pricePerUnit: 75 },
    ]
  },
  {
    id: 'order124', orderNumber: 'SELLIO-12366', date: '2025-04-14T15:30:00Z', status: 'Shipped', totalAmount: 120.00,
    items: [
      { id: 'item3', productId: 3, productName: 'Винтажная Сумка...', productImage: '/images/placeholder-bag.jpg', quantity: 1, pricePerUnit: 120 },
    ]
  },
   {
    id: 'order125', orderNumber: 'SELLIO-12370', date: '2025-04-15T09:00:00Z', status: 'Processing', totalAmount: 55.99,
    items: [
      { id: 'item4', productId: 4, productName: 'Шелковый Шарф с Узором', productImage: '/images/placeholder-scarf.jpg', quantity: 1, pricePerUnit: 55.99 },
     ]
  },
   {
    id: 'order120', orderNumber: 'SELLIO-12301', date: '2025-03-20T11:00:00Z', status: 'Cancelled', totalAmount: 30.00,
    items: [
      { id: 'item5', productId: 5, productName: 'Набор Косметики', productImage: '/images/placeholder-cosmetics.jpg', quantity: 1, pricePerUnit: 30.00 },
     ]
  },
];
// --- Конец Mock Данных ---

export default function OrdersPage() {
  // Состояние для хранения заказов (пока используем mock)
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Флаг загрузки

  // Имитация загрузки данных при монтировании компонента
  useEffect(() => {
    console.log("Загрузка истории заказов...");
    // --- !!! ЗДЕСЬ НУЖЕН РЕАЛЬНЫЙ FETCH ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ !!! ---
    setTimeout(() => {
      setOrders(mockOrders); // Устанавливаем mock данные
      setIsLoading(false);
      console.log("История заказов загружена (mock).");
    }, 1500); // Имитация задержки
  }, []); // Пустой массив зависимостей - выполнить один раз

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">История заказов</h1>

      {isLoading ? (
        // Состояние загрузки (простой текст или скелетоны)
        <div className="space-y-4">
           <p className="text-gray-500">Загрузка ваших заказов...</p>
           {/* Пример скелетона */}
           <div className="bg-gray-100 p-5 rounded-lg h-32 animate-pulse"></div>
           <div className="bg-gray-100 p-5 rounded-lg h-32 animate-pulse"></div>
        </div>
      ) : orders.length === 0 ? (
        // Состояние, когда заказов нет
        <p className="text-gray-500">У вас пока нет заказов.</p>
      ) : (
        // Отображение списка заказов
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}