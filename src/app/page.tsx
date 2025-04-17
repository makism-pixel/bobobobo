// src/app/page.tsx (Сетка товаров вместо горизонтального скролла)
import Image from 'next/image';
import Link from 'next/link';
// HorizontalProductScroll больше не нужен
// import HorizontalProductScroll from '@/components/products/HorizontalProductScroll';
import ProductCard from '@/components/products/ProductCard'; // Импортируем карточку
import { IProduct } from '@/types';

// --- Mock Данные ---
const mockProducts: IProduct[] = [
  { id: 1, name: 'Элегантное Бордовое Платье Макси', price: 50, discount: 20, image: '/images/placeholder-dress.jpg' },
  { id: 2, name: 'Классические Туфли на Каблуке', price: 75, image: '/images/placeholder-shoes.jpg' },
  { id: 3, name: 'Винтажная Сумка из Кожи', price: 120, image: '/images/placeholder-bag.jpg' },
  { id: 4, name: 'Шелковый Шарф с Узором Пейсли', price: 35, image: '/images/placeholder-scarf.jpg' },
  { id: 5, name: 'Золотистое Ожерелье-Цепочка', price: 45, discount: 10, image: '/images/placeholder-necklace.jpg' },
  { id: 6, name: 'Мужские Часы Хронограф', price: 180, image: '/images/placeholder-watch.jpg' },
  { id: 7, name: 'Кашемировый Свитер (Бежевый)', price: 90, image: '/images/placeholder-sweater.jpg' },
  { id: 8, name: 'Кожаные Перчатки (Черные)', price: 40, image: '/images/placeholder-gloves.jpg' },
   // Можно добавить больше товаров, чтобы проверить перенос на новые строки
   { id: 9, name: 'Товар 9', price: 50, image: '/images/placeholder.png' },
   { id: 10, name: 'Товар 10', price: 60, discount: 5, image: '/images/placeholder.png' },
   { id: 11, name: 'Товар 11', price: 70, image: '/images/placeholder.png' },
   { id: 12, name: 'Товар 12', price: 80, image: '/images/placeholder.png' },
];
// --- Конец Mock Данных ---

export default function HomePage() {
  // Берем первые 8 товаров для примера (2 ряда по 4 на больших экранах)
  const productsToShow = mockProducts.slice(0, 8);
  // Или можно показывать все: const productsToShow = mockProducts;

  return (
    <div className="bg-gray-50 min-h-screen">

        {/* --- Секция Баннера (без изменений) --- */}
        <section className="relative w-full h-64 md:h-80 lg:h-96 ... mb-8 md:mb-12">
             <Image src="https://img.freepik.com/free-photo/blackfriday-celebration-marketing_23-2151861857.jpg?..." alt="Баннер Black Friday" fill priority className="..." />
             <div className="absolute inset-0 flex ..."> ... </div>
        </section>
        {/* --- Конец Секции Баннера --- */}


        {/* --- Секция Каталога с СЕТКОЙ --- */}
        <section className="py-6 md:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5">Популярные товары</h2>

                {/* --- КОНТЕЙНЕР СЕТКИ --- */}
                {/* mobile: 2 колонки, sm: 3 колонки, lg: 4 колонки */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {productsToShow.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                 {/* --- КОНЕЦ СЕТКИ --- */}

                 {/* Можно добавить кнопку "Смотреть все", если показываем не все товары */}
                 {mockProducts.length > productsToShow.length && (
                    <div className="text-center mt-8">
                        <Link href="/catalog">
                            <button className="px-6 py-2 border border-burgundy-base text-burgundy-base font-medium rounded-md hover:bg-burgundy-base/10 transition-colors text-sm">
                                Смотреть все товары
                            </button>
                        </Link>
                    </div>
                 )}

            </div>
        </section>
        {/* --- Конец Секции Каталога --- */}


        {/* --- Другие секции главной страницы (без изменений) --- */}
        <section className="py-8 md:py-16 bg-white mt-8 md:mt-12"> ... </section>
        {/* --- Конец Других Секций --- */}

    </div>
  );
}