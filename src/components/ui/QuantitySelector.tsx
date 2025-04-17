import React from 'react';
import { Minus, Plus } from 'lucide-react';

// ... (интерфейс QuantitySelectorProps остается тем же) ...
interface QuantitySelectorProps { quantity: number; onDecrease: () => void; onIncrease: () => void; min?: number; max?: number; }


export default function QuantitySelector({ quantity, onDecrease, onIncrease, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    // --- ИЗМЕНЕНИЯ ЗДЕСЯ ---
    // Светлый фон, темные иконки/текст, бордовая обводка при фокусе
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm focus-within:ring-1 focus-within:ring-burgundy-base focus-within:border-burgundy-base">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="px-2.5 py-1.5 text-gray-500 hover:text-burgundy-base hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Уменьшить количество"
      >
        <Minus size={14} />
      </button>
      <span className="px-3 py-1 text-sm font-medium text-gray-900 select-none min-w-[34px] text-center tabular-nums">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="px-2.5 py-1.5 text-gray-500 hover:text-burgundy-base hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Увеличить количество"
      >
        <Plus size={14} />
      </button>
    </div>
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---
  );
}