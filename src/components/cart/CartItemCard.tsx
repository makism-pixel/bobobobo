import React from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react'; // Иконка удаления
import { ICartItem } from '@/types'; // Тип элемента корзины
import QuantitySelector from '../ui/QuantitySelector'; // Компонент выбора количества

interface CartItemCardProps {
  item: ICartItem;             // Данные товара
  isPendingDeletion: boolean;  // Флаг: ожидает ли товар удаления?
  onQuantityChange: (itemId: string, newQuantity: number) => void; // Колбэк изменения кол-ва
  onRemoveItem: (itemId: string) => void; // Колбэк запроса на удаление
}

export default function CartItemCard({
  item,
  isPendingDeletion, // Получаем флаг
  onQuantityChange,
  onRemoveItem
}: CartItemCardProps) {

  // Расчет цен (как и раньше)
  const originalPrice = item.product.price;
  const discount = item.product.discount;
  const currentPrice = discount ? originalPrice * (1 - discount / 100) : originalPrice;
  const totalPrice = currentPrice * item.quantity;

  // Базовые классы для карточки (стиль "белая с бордовой обводкой")
  const baseClasses = "flex flex-col md:flex-row gap-4 md:gap-6 p-5 bg-white rounded-xl shadow-md border border-burgundy-base/50 text-gray-700 overflow-hidden transition-all duration-300 ease-in-out";
  // Дополнительные классы для состояния ожидания удаления (полупрозрачность, нет кликов, легкое уменьшение)
  const pendingClasses = "opacity-50 pointer-events-none scale-[0.98]";

  return (
    // Применяем базовые классы и добавляем pendingClasses, если isPendingDeletion === true
    <div className={`${baseClasses} ${isPendingDeletion ? pendingClasses : 'hover:shadow-lg'}`}>

      {/* Изображение товара */}
      <div className="flex-shrink-0 w-28 h-28 md:w-[90px] md:h-[90px] relative self-center md:self-start border border-gray-200 rounded-lg overflow-hidden">
        <Image
          src={item.product.image || '/images/placeholder.png'}
          alt={item.product.name}
          fill
          sizes="(max-width: 768px) 112px, 90px"
          className="object-cover"
        />
        {/* Стикер скидки */}
        {discount && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
      </div>

      {/* Информация о товаре */}
      <div className="flex-grow flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-gray-900 hover:text-burgundy-base transition-colors line-clamp-2 leading-snug">
          {item.product.name}
        </h3>
        {/* Атрибуты (размер, цвет) */}
        {item.attributes && (
          <div className="text-xs text-gray-500 space-x-3">
            {item.attributes.size && <span>Размер: <span className="font-medium text-gray-800">{item.attributes.size}</span></span>}
            {item.attributes.color && <span>Цвет: <span className="font-medium text-gray-800">{item.attributes.color}</span></span>}
          </div>
        )}
        {/* Цена за штуку */}
        <div className="text-sm mt-1">
          <span className="mr-2 opacity-80">Цена:</span>
          <span className="font-semibold text-gray-900">{currentPrice.toFixed(2)} €</span>
          {discount && (
            <span className="text-xs text-gray-400 line-through ml-2">{originalPrice.toFixed(2)} €</span>
          )}
        </div>
      </div>

      {/* Блок с количеством и итоговой ценой за позицию */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-3 md:w-auto pt-2 md:pt-0 border-t border-gray-100 md:border-none mt-3 md:mt-0">
        <QuantitySelector
            quantity={item.quantity}
            onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
            onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
        />
        <div className="text-base font-bold text-gray-900 md:mt-2 whitespace-nowrap">
          {totalPrice.toFixed(2)} €
        </div>
      </div>

      {/* Кнопка удаления */}
      <div className="flex items-center md:items-start flex-shrink-0 self-center md:self-auto md:ml-2">
        <button
          // Вызываем обработчик handleRemoveItem из page.tsx при клике
          onClick={() => onRemoveItem(item.id)}
          title="Удалить товар"
          className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}