// src/components/cart/CartSummary.tsx
import React from 'react';
import Link from 'next/link';

// Добавлены onShowDeliveryTerms и onShowReturnPolicy
interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryCost?: number;
  total: number;
  checkoutDisabled?: boolean;
  onShowDeliveryTerms: () => void; // <--- НОВЫЙ ПРОПС
  onShowReturnPolicy: () => void;  // <--- НОВЫЙ ПРОПС
}

export default function CartSummary({
  itemCount,
  subtotal,
  discount,
  deliveryCost = 0,
  total,
  checkoutDisabled = false,
  onShowDeliveryTerms, // <--- Получаем функцию
  onShowReturnPolicy   // <--- Получаем функцию
}: CartSummaryProps) {
  return (
    <div className="p-5 bg-white rounded-xl border border-burgundy-base/50 shadow-md text-gray-700 space-y-3.5">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-3">Итоги заказа</h2>

      {/* Отображение сумм */}
      <div className="flex justify-between text-sm"><span>Товары ({itemCount} шт.)</span><span className="text-gray-900 font-medium tabular-nums">{subtotal.toFixed(2)} €</span></div>
      {discount > 0 && (<div className="flex justify-between text-sm text-green-600"><span>Скидка</span><span className="font-medium tabular-nums">-{discount.toFixed(2)} €</span></div>)}
      {deliveryCost > 0 && (<div className="flex justify-between text-sm"><span>Доставка</span><span className="text-gray-900 font-medium tabular-nums">{deliveryCost.toFixed(2)} €</span></div>)}
      <hr className="border-t-2 border-gray-200 border-dashed my-4" />
      <div className="flex justify-between text-lg font-bold text-gray-900"><span>Итого:</span><span className="tabular-nums">{total.toFixed(2)} €</span></div>

      {/* Кнопка Оформления */}
      <div className="pt-5 hidden lg:block">
         <div className="relative" title={checkoutDisabled ? 'Пожалуйста, выберите пункт самовывоза' : ''}>
            <Link href={checkoutDisabled ? "#" : "/checkout"} aria-disabled={checkoutDisabled} className={`block ${checkoutDisabled ? 'pointer-events-none' : ''}`} tabIndex={checkoutDisabled ? -1 : undefined}>
                <button className={`w-full text-white font-bold py-3 px-5 rounded-lg shadow-button ... ${ checkoutDisabled ? 'bg-gray-400 ...' : 'bg-burgundy-base ...' }`} disabled={checkoutDisabled} >Перейти к оформлению</button>
            </Link>
         </div>
      </div>

      {/* Обновленный текст с кнопками */}
      <p className="text-xs text-center text-gray-500 pt-2">
        Оформляя заказ, вы принимаете {' '}
        <button type="button" onClick={onShowDeliveryTerms} className="underline text-burgundy-base/80 hover:text-burgundy-base transition-colors font-medium">условия доставки</button>
         {' '}и{' '}
        <button type="button" onClick={onShowReturnPolicy} className="underline text-burgundy-base/80 hover:text-burgundy-base transition-colors font-medium">возврата</button>
        .
      </p>
    </div>
  );
}