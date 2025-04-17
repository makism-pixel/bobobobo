// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      // ... твои пути ...
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          // --- Твои существующие бордовые цвета ---
          burgundy: {
            darkest: '#1F080A', dark: '#2C0B0E', medium: '#3A0F13',
            base: '#5C1A23', light: '#802D3A', lighter: '#A54050',
          },
          'brand-text': { primary: '#F5F5F5', secondary: '#BDBDBD', },
          'brand-border': 'rgba(255, 255, 255, 0.1)',
          // --- ДОБАВЛЯЕМ СИНИЙ ДЛЯ КНОПОК ---
          'brand-blue': {
            DEFAULT: '#2563EB', // Пример: Tailwind blue-600
            light: '#3B82F6',  // Пример: blue-500 (для ховера)
            dark: '#1D4ED8',   // Пример: blue-700
          },
        },
        boxShadow: {
          'subtle': '0 4px 15px rgba(0, 0, 0, 0.2)',
          'button': '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
        // ... остальное ...
      },
    },
    plugins: [],
  }