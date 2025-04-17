// src/app/layout.tsx (С AuthProvider)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext'; // <--- Импорт провайдера

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sellio - Лучший маркетплейс',
  description: 'Покупайте товары с быстрой доставкой по всей Латвии и ЕС',
  keywords: 'маркетплейс, покупки, интернет магазин',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-white antialiased`}>
        {/* Оборачиваем в AuthProvider */}
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <footer className="bg-burgundy-darkest text-brand-text-secondary py-8 mt-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col md:flex-row justify-between items-center">
                   <div className="mb-6 md:mb-0 text-center md:text-left">
                     <h3 className="text-xl font-bold text-brand-text-primary mb-1">Sellio</h3>
                     <p className="text-sm">© {new Date().getFullYear()} Все права защищены</p>
                   </div>
                   <div className="flex flex-col md:flex-row gap-8 text-center md:text-left">
                      <div> <h4 className="font-semibold text-brand-text-primary mb-3">Покупателям</h4> <ul className="space-y-2 text-sm"> <li><a href="#" className="hover:text-brand-text-primary transition-colors">Доставка</a></li> <li><a href="#" className="hover:text-brand-text-primary transition-colors">Оплата</a></li> <li><a href="#" className="hover:text-brand-text-primary transition-colors">Возврат</a></li> </ul> </div>
                      <div> <h4 className="font-semibold text-brand-text-primary mb-3">Контакты</h4> <ul className="space-y-2 text-sm"> <li>+371 12345678</li> <li>selliomanager@gmail.com</li> <li>Рига, Латвия</li> </ul> </div>
                   </div>
                 </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}