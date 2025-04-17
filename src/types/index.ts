// src/types/index.ts (Полная объединенная версия)

// --- Типы Продуктов ---
export interface IProduct {
  id: number | string;
  name: string;
  price: number;
  discount?: number; // Скидка в %
  image?: string; // Путь к изображению
  // Добавь другие поля продукта, если нужно (описание, категория и т.д.)
}

// --- Типы Корзины ---
export interface ICartItem {
  id: string; // Уникальный ID элемента В КОРЗИНЕ
  product: IProduct; // Сам товар
  quantity: number;
  attributes?: { // Атрибуты типа размер/цвет
    size?: string;
    color?: string;
  };
}

// --- Типы Пунктов Самовывоза ---
export interface IPickupPoint {
  id: string;
  provider: string; // e.g., "Omniva", "DPD"
  name: string;
  address: string;
  hours?: string;
  distance?: string; // Расстояние (опционально, если рассчитывается)
  lat: number; // Широта
  lng: number; // Долгота
}

// --- Состояние Корзины (Глобальное или на странице) ---
export interface ICartState {
  items: ICartItem[];
  promoCode?: string;
  promoDiscount?: number; // Сумма скидки по промокоду
  deliveryCost?: number; // Может быть не нужно, если доставка бесплатная или только самовывоз
  selectedPickupPointId?: string | null; // ID выбранного пункта самовывоза
}


// --- Типы Заказов ---
export interface IOrderItem {
  id: string; // ID позиции в конкретном заказе
  productId: string | number; // Ссылка на ID продукта
  productName: string; // Название на момент заказа
  productImage?: string; // Картинка на момент заказа
  quantity: number; // Количество в заказе
  pricePerUnit: number; // Цена за единицу на момент заказа
}

export interface IOrder {
  id: string; // Уникальный ID заказа (из БД)
  orderNumber: string; // Номер заказа для отображения пользователю (напр., "SELLIO-12345")
  date: string; // Дата заказа в формате ISO 8601 ("YYYY-MM-DDTHH:mm:ssZ")
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'; // Примерный набор статусов
  totalAmount: number; // Общая сумма заказа
  items: IOrderItem[]; // Массив товаров в этом заказе
  // --- Сюда можно и нужно добавить другие важные поля заказа ---
  // userId?: string;
  // shippingAddress?: { /* ... */ };
  // pickupPoint?: IPickupPoint | null;
  // trackingNumber?: string | null;
  // paymentMethod?: string;
  // sellerId?: string | string[]; // Может быть несколько продавцов в заказе маркетплейса
}

// --- Можно добавить и другие общие типы здесь ---
// Например, тип для Пользователя, если не используется тип из Supabase напрямую
// export interface IUser {
//   id: string;
//   email: string;
//   nickname?: string;
//   role?: 'buyer' | 'seller';
//   // ... другие поля профиля
// }