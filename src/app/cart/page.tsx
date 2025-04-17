'use client'; // Корзина интерактивна

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, RotateCcw } from 'lucide-react'; // Иконки

// Импорты компонентов корзины
import CartHeader from '@/components/cart/CartHeader';
import CartItemsList from '@/components/cart/CartItemsList';
import PromoCodeInput from '@/components/cart/PromoCodeInput';
import CartSummary from '@/components/cart/CartSummary'; // Импортируем обновленный
import EmptyCart from '@/components/cart/EmptyCart';
import PickupPointModal from '@/components/cart/PickupPointModal'; // Модалка пакоматов
import InfoModal from '@/components/ui/InfoModal'; // Модалка для Условий
import DeliveryTermsContent from '@/components/legal/DeliveryTermsContent'; // Контент Условий Доставки
import ReturnPolicyContent from '@/components/legal/ReturnPolicyContent'; // Контент Условий Возврата

// Импорты типов
import { ICartState, ICartItem, IPickupPoint } from '@/types';

// --- Mock Data для Корзины ---
const initialCartItems: ICartItem[] = [
    { id: 'item1', product: { id: 1, name: 'Элегантное Бордовое Платье Макси с Разрезом и V-образным вырезом', price: 50, discount: 20, image: '/images/placeholder-dress.jpg' }, quantity: 1, attributes: { size: 'M', color: 'Бордовый' } },
    { id: 'item2', product: { id: 2, name: 'Классические Туфли на Каблуке', price: 75, image: '/images/placeholder-shoes.jpg' }, quantity: 1, attributes: { size: '38', color: 'Черный' } },
    { id: 'item3', product: { id: 3, name: 'Винтажная Сумка из Натуральной Кожи', price: 120, image: '/images/placeholder-bag.jpg' }, quantity: 1, attributes: { color: 'Темно-коричневый' } },
];
// --- Конец Mock Data Корзины ---


// --- Mock Data для Пунктов Самовывоза (ПОЛНЫЙ СПИСОК ИЗ 6 ПРИМЕРОВ) ---
const examplePickupPoints: IPickupPoint[] = [
  // Riga Examples (3)
  { id: 'omniva_riga_origo', provider: 'Omniva', name: 'ТЦ Origo', address: 'Stacijas laukums 2, Рига', hours: '00:00-24:00', distance: '0.5 км', lat: 56.948, lng: 24.125 },
  { id: 'dpd_riga_galerija', provider: 'DPD', name: 'ТЦ Galerija Centrs', address: 'Audēju iela 16, Рига', hours: '10:00-21:00', distance: '1.1 км', lat: 56.947, lng: 24.111 },
  { id: 'omniva_riga_valdemara', provider: 'Omniva', name: 'Rimi Valdemāra', address: 'Krišjāņa Valdemāra iela 112, Рига', hours: '08:00-23:00', distance: '2.5 км', lat: 56.965, lng: 24.118 },
  // Other Cities Examples (3)
  { id: 'omniva_jelgava_rimi', provider: 'Omniva', name: 'Rimi Hipermārkets', address: 'Katoļu iela 18, Jelgava', hours: '08:00-23:00', distance: '45 км', lat: 56.649, lng: 23.730 },
  { id: 'dpd_liepaja_maxima', provider: 'DPD', name: 'Maxima XXX', address: 'Klaipēdas iela 62, Liepāja', hours: '08:00-22:00', distance: '220 км', lat: 56.505, lng: 21.015 },
  { id: 'venipak_daugavpils', provider: 'Venipak', name: 'Pickup Point Daugavpils', address: 'Rīgas iela 9, Daugavpils', hours: '09:00-18:00', distance: '230 км', lat: 55.874, lng: 26.536 },
];
// --- Конец Mock Data Пунктов Самовывоза ---

// Константа для времени отображения уведомления "Отменить удаление"
const UNDO_TIMEOUT = 3000; // 3 секунды

export default function CartPage() {
  // --- Состояния ---
  const [cartItems, setCartItems] = useState<ICartItem[]>(initialCartItems);
  const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [deliveryCost] = useState<number>(5);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<IPickupPoint | null>(null);
  const [availablePickupPoints, setAvailablePickupPoints] = useState<IPickupPoint[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [itemPendingDeletion, setItemPendingDeletion] = useState<ICartItem | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalContentComponent, setInfoModalContentComponent] = useState<React.ReactNode | null>(null);
  // --- Конец Состояний ---

  // --- useEffect-ы ---
  useEffect(() => {
    if (isPickupModalOpen && availablePickupPoints.length === 0) {
      setIsLoadingPoints(true);
      setTimeout(() => {
        setAvailablePickupPoints(examplePickupPoints); // ЗАМЕНИТЬ НА FETCH
        setIsLoadingPoints(false);
      }, 1000);
    }
  }, [isPickupModalOpen, availablePickupPoints.length]);

  useEffect(() => {
    return () => { if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); }};
  }, []);
  // --- Конец useEffect-ов ---

  // --- Обработчики ---
  const handleQuantityChange = (itemId: string, newQuantity: number) => { setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item)); };
  const performActualRemove = (itemId: string) => { setCartItems(prev => prev.filter(item => item.id !== itemId)); setItemPendingDeletion(null); if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; } };
  const handleRemoveItem = (itemId: string) => { const itemToRemove = cartItems.find(item => item.id === itemId); if (!itemToRemove) return; if (undoTimerRef.current && itemPendingDeletion && itemPendingDeletion.id !== itemId) { clearTimeout(undoTimerRef.current); performActualRemove(itemPendingDeletion.id); } else if (undoTimerRef.current && itemPendingDeletion?.id === itemId) { clearTimeout(undoTimerRef.current); performActualRemove(itemId); return; } setItemPendingDeletion(itemToRemove); undoTimerRef.current = setTimeout(() => { performActualRemove(itemId); }, UNDO_TIMEOUT); };
  const handleUndoRemove = () => { if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; } setItemPendingDeletion(null); };
  const handleClearCart = () => { setCartItems([]); setSelectedPickupPoint(null); setItemPendingDeletion(null); if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; } };
  const handleApplyPromoCode = async (code: string): Promise<boolean> => { if (code.toUpperCase() === 'PROMO10') { setPromoCode(code); setPromoDiscount(10); return true; } setPromoCode(code); setPromoDiscount(0); return false; };
  const handleSelectPickupPoint = (point: IPickupPoint) => { setSelectedPickupPoint(point); setIsPickupModalOpen(false); };
  const showDeliveryTerms = () => { setInfoModalTitle("Условия Доставки"); setInfoModalContentComponent(<DeliveryTermsContent />); setIsInfoModalOpen(true); };
  const showReturnPolicy = () => { setInfoModalTitle("Условия Возврата и Обмена"); setInfoModalContentComponent(<ReturnPolicyContent />); setIsInfoModalOpen(true); };
  const closeInfoModal = () => { setIsInfoModalOpen(false); };
  // --- Конец Обработчиков ---

  // --- Расчет итогов ---
  const itemsForCalculation = cartItems.filter(item => item.id !== itemPendingDeletion?.id);
  const subtotal = itemsForCalculation.reduce((sum, item) => { const price = item.product.discount ? item.product.price * (1 - item.product.discount / 100) : item.product.price; return sum + price * item.quantity; }, 0);
  const totalDiscountFromItems = itemsForCalculation.reduce((sum, item) => { const itemDiscount = item.product.discount ? (item.product.price * (item.product.discount / 100)) * item.quantity : 0; return sum + itemDiscount; }, 0);
  const totalDiscount = promoDiscount + totalDiscountFromItems;
  const currentDeliveryCost = selectedPickupPoint ? 0 : deliveryCost;
  const total = subtotal - promoDiscount + currentDeliveryCost;
  // --- Конец Расчета итогов ---

  // --- Рендеринг ---
  if (itemsForCalculation.length === 0 && !itemPendingDeletion) {
    return <EmptyCart />;
  }

  return (
    <div className="bg-gradient-to-b from-white via-rose-50 to-burgundy-base/20 min-h-screen text-gray-900 font-sans relative">
      <CartHeader onClearCart={handleClearCart} />

      {/* Уведомление об Удалении */}
      {itemPendingDeletion && ( <div className="sticky top-[70px] md:top-[85px] z-30 px-4 sm:px-6 lg:px-8 mt-[-16px] mb-4 pointer-events-none animate-fade-in-down"> <div className="container mx-auto pointer-events-auto max-w-md ml-auto mr-auto md:mr-0"> <div className="bg-white border border-burgundy-base/40 rounded-lg shadow-lg p-3 flex items-center justify-between "> <span className="text-sm text-gray-700 truncate pr-2"> Товар "{itemPendingDeletion.product.name}" удален. </span> <button onClick={handleUndoRemove} className="flex items-center text-sm text-burgundy-base hover:text-burgundy-dark font-semibold ml-3 px-3 py-1 rounded-md border border-burgundy-base/30 hover:bg-burgundy-base/10 transition-all duration-200 ease-in-out flex-shrink-0" > <RotateCcw size={14} className="mr-1.5" /> Отменить </button> </div> </div> </div> )}

      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-16 ${itemPendingDeletion ? 'pt-6 md:pt-10' : 'pt-10 md:pt-16'} transition-all duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
           {/* Левая колонка */}
           <div className="lg:col-span-2">
            <CartItemsList
              items={cartItems}
              pendingDeletionId={itemPendingDeletion?.id ?? null}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
            />
           </div>

           {/* Правая колонка */}
           <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
             <PromoCodeInput onApply={handleApplyPromoCode} currentCode={promoCode}/>
             {/* Блок Выбора/Отображения Пункта Самовывоза */}
             <div className="p-4 bg-white rounded-xl border border-burgundy-base/50 shadow-md">
               <h3 className="text-base font-semibold text-gray-900 mb-2">Пункт самовывоза</h3>
               {selectedPickupPoint ? ( <div> <p className="text-sm font-medium text-gray-800">{selectedPickupPoint.provider} - {selectedPickupPoint.name}</p> <p className="text-xs text-gray-500">{selectedPickupPoint.address}</p> <button onClick={() => setIsPickupModalOpen(true)} className="text-xs text-burgundy-base hover:text-burgundy-light underline mt-1">Изменить</button> </div> )
               : ( <button onClick={() => setIsPickupModalOpen(true)} className="w-full text-left text-sm text-gray-500 hover:text-burgundy-base border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center transition-colors"> <MapPin size={16} className="mr-2 flex-shrink-0" /> Выбрать пункт самовывоза </button> )}
             </div>

            {/* Итоги Заказа */}
            <CartSummary
              itemCount={itemsForCalculation.length}
              subtotal={subtotal}
              discount={totalDiscount}
              deliveryCost={currentDeliveryCost}
              total={total}
              checkoutDisabled={!selectedPickupPoint}
              onShowDeliveryTerms={showDeliveryTerms} // Передаем обработчик
              onShowReturnPolicy={showReturnPolicy}   // Передаем обработчик
            />
           </div>
        </div>
      </main>

       {/* Фиксированная кнопка для мобильных */}
       <div className="sticky bottom-0 left-0 right-0 lg:hidden p-4 bg-white border-t border-gray-200 z-20 shadow-[-2px_0px_15px_rgba(0,0,0,0.1)]">
         <button className={`w-full text-white font-bold py-3 px-5 rounded-lg shadow-button transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burgundy-lighter focus-visible:ring-offset-white ${ !selectedPickupPoint ? 'bg-gray-400 cursor-not-allowed' : 'bg-burgundy-base hover:bg-burgundy-light transform hover:scale-[1.02]' }`} disabled={!selectedPickupPoint} title={!selectedPickupPoint ? 'Пожалуйста, выберите пункт самовывоза' : ''} > Перейти к оформлению ({total.toFixed(2)} €) </button>
       </div>

       {/* Модальное окно выбора пункта самовывоза */}
       {isPickupModalOpen && (
         <PickupPointModal
            isOpen={isPickupModalOpen}
            onClose={() => setIsPickupModalOpen(false)}
            points={isLoadingPoints ? [] : availablePickupPoints}
            onSelectPoint={handleSelectPickupPoint}
            // isLoading={isLoadingPoints}
         />
       )}

       {/* Модальное окно для Условий */}
       <InfoModal
        isOpen={isInfoModalOpen}
        onClose={closeInfoModal}
        title={infoModalTitle}
       >
         {infoModalContentComponent}
       </InfoModal>

       {/* Анимация для уведомления */}
       <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}