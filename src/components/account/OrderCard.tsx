// src/components/account/OrderCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IOrder } from '@/types'; // Импорт типа заказа
import { Package, CheckCircle, XCircle, Truck, RefreshCw, Info } from 'lucide-react'; // Иконки для статусов

// Функция для форматирования даты (пример)
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('lv-LV', { // Используем латвийскую локаль
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return dateString; // Возвращаем как есть, если формат некорректный
  }
};

// Функция для отображения статуса с иконкой и цветом
const renderStatus = (status: IOrder['status']) => {
  switch (status) {
    case 'Delivered':
      return <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full"><CheckCircle size={14} className="mr-1.5"/>Доставлен</span>;
    case 'Shipped':
      return <span className="flex items-center text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full"><Truck size={14} className="mr-1.5"/>Отправлен</span>;
    case 'Processing':
      return <span className="flex items-center text-xs font-medium text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full"><RefreshCw size={14} className="mr-1.5 animate-spin-slow"/>В обработке</span>;
    case 'Cancelled':
      return <span className="flex items-center text-xs font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full"><XCircle size={14} className="mr-1.5"/>Отменен</span>;
    case 'Returned':
       return <span className="flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full"><Info size={14} className="mr-1.5"/>Возвращен</span>;
    case 'Pending':
    default:
      return <span className="flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full"><Package size={14} className="mr-1.5"/>Ожидает</span>;
  }
};

interface OrderCardProps {
  order: IOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.length;
  // Показываем первые 3-4 картинки товаров
  const previewItems = order.items.slice(0, 4);

  return (
    // Карточка в стиле как у корзины - белый фон, бордер
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
      {/* Верхняя часть: Номер, Дата, Статус, Сумма */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Заказ № {order.orderNumber}</p>
          <p className="text-xs text-gray-500">от {formatDate(order.date)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
           {renderStatus(order.status)}
           <p className="text-sm font-bold text-gray-900">{order.totalAmount.toFixed(2)} €</p>
        </div>
      </div>

      {/* Превью товаров */}
      <div className="flex items-center space-x-2 mb-4 overflow-hidden">
        {previewItems.map((item, index) => (
          <div key={item.id + index} className="flex-shrink-0 w-12 h-12 relative border border-gray-100 rounded overflow-hidden">
            <Image
              src={item.productImage || '/images/placeholder.png'} // Нужен плейсхолдер
              alt={item.productName.substring(0, 20)}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ))}
        {/* Если товаров больше, чем показано */}
        {itemCount > previewItems.length && (
            <div className="flex-shrink-0 w-12 h-12 border border-gray-200 border-dashed rounded bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                +{itemCount - previewItems.length}
            </div>
        )}
      </div>

      {/* Кнопка Детали */}
      {/* TODO: Сделать ссылку на страницу деталей заказа /account/orders/{order.id} */}
      <Link href={`/account/orders/${order.id}`} className="block mt-3">
        <button className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-burgundy-base border border-burgundy-base/50 rounded-md hover:bg-burgundy-base/10 transition-colors duration-200">
          Посмотреть детали
        </button>
      </Link>
    </div>
  );
}