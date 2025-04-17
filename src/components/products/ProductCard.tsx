// src/components/products/ProductCard.tsx (Добавлен 'use client')
'use client'; // <--- ДОБАВЛЕНО ЗДЕСЬ!

import React from 'react'; // useState/useEffect тут не нужны пока
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { IProduct } from '@/types';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;

  // Обработчик добавления в корзину (остается здесь)
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     e.stopPropagation();
     alert(`Добавление ${product.name} в корзину (логика не реализована)`);
  };

  // Обработчик нажатия Enter/Space на карточке (остается здесь)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
       // Позволяем Link сработать
    }
  };

  return (
    // Основной контейнер карточки
    <div
       className="group relative flex flex-col bg-white rounded-lg overflow-hidden
                 w-44 md:w-52 flex-shrink-0 {/* Ширина */}
                 border-2 border-burgundy-base/80 {/* Обводка */}
                 transition-all duration-300 ease-in-out
                 hover:shadow-xl hover:border-burgundy-base {/* Hover */}
                 focus-within:ring-2 focus-within:ring-burgundy-base focus-within:ring-offset-2" // Фокус
        // snap-center УБРАН
    >
      <Link href={`/product/${product.id}`} className="block flex-grow flex flex-col cursor-pointer focus:outline-none" aria-label={`Перейти к товару ${product.name}`} onKeyDown={handleKeyDown} >
        {/* Контейнер Изображения */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
          <Image src={product.image || '/images/placeholder.png'} alt={product.name} fill sizes="(max-width: 768px) 176px, 208px" className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
           {product.discount && ( <div className="absolute top-1.5 right-1.5 ..."> -{product.discount}% </div> )}
        </div>
        {/* Информация о товаре */}
        <div className="p-3 text-sm flex flex-col flex-grow">
          <h3 className="font-semibold ... line-clamp-2 ..." title={product.name}> {product.name} </h3>
          <div className="mt-auto pt-2 flex ..."> {/* Цена */}
            <span className="font-bold text-base ...">{discountedPrice.toFixed(2)} €</span>
            {product.discount && ( <span className="text-xs ...">...</span> )}
          </div>
        </div>
      </Link>
       {/* Кнопка добавления в корзину */}
       <div className="px-3 pb-3 pt-1">
           <button onClick={handleAddToCart} className="w-full px-3 py-2 ..." aria-label={`...`} >
             <ShoppingCart size={16}/> В корзину
           </button>
       </div>
    </div>
  );
}