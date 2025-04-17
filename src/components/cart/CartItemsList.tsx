import React from 'react';
import { ICartItem } from '@/types'; // Убедись, что тип импортирован
import CartItemCard from './CartItemCard'; // Импорт дочернего компонента

interface CartItemsListProps {
  items: ICartItem[];                // Массив всех товаров в корзине
  pendingDeletionId: string | null; // ID товара, ожидающего удаления (или null)
  onQuantityChange: (itemId: string, newQuantity: number) => void; // Колбэк изменения кол-ва
  onRemoveItem: (itemId: string) => void; // Колбэк запроса на удаление (с логикой Undo)
}

export default function CartItemsList({
  items,
  pendingDeletionId, // Получаем ID товара в ожидании
  onQuantityChange,
  onRemoveItem
}: CartItemsListProps) {
  return (
    // Просто рендерим список карточек, передавая нужные пропсы
    <div className="space-y-4"> {/* Отступы между карточками */}
      {items.map((item) => (
        <CartItemCard
          key={item.id} // Уникальный ключ для React
          item={item} // Передаем данные товара
          // Вычисляем флаг: является ли ЭТА карточка ожидающей удаления
          isPendingDeletion={item.id === pendingDeletionId}
          onQuantityChange={onQuantityChange} // Передаем колбэки дальше
          onRemoveItem={onRemoveItem}
        />
      ))}
      {/* Если список items пуст (даже если pendingDeletionId есть), здесь ничего не отрендерится */}
    </div>
  );
}