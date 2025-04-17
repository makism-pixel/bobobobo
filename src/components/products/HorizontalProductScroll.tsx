// src/components/products/HorizontalProductScroll.tsx (Исправлен className)
'use client';

import React from 'react';
import { IProduct } from '@/types';
import ProductCard from './ProductCard';

interface HorizontalProductScrollProps {
  title: string;
  products: IProduct[];
}

export default function HorizontalProductScroll({ title, products }: HorizontalProductScrollProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5">{title}</h2>
        <div className="relative">
          {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Все классы в одну строку --- */}
          <div
            className="flex space-x-4 md:space-x-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth" // <-- Все в одну строку
          >
          {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}

            {/* Отступ слева для snap */}
            <div className="flex-shrink-0 w-[calc(50%-theme(spacing.24))] md:w-[calc(50%-theme(spacing.28))] order-first"></div>

            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Отступ справа для snap */}
            <div className="flex-shrink-0 w-[calc(50%-theme(spacing.24))] md:w-[calc(50%-theme(spacing.28))]"></div>

          </div>
            {/* Кнопки прокрутки (закомментированы) */}
            {/* ... */}
        </div>
      </div>
      {/* Стиль для скрытия скроллбара */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}