import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Gift } from 'lucide-react';

// ... (интерфейс PromoCodeInputProps и логика остаются теми же) ...
interface PromoCodeInputProps { onApply: (code: string) => Promise<boolean> | boolean; currentCode?: string; }


export default function PromoCodeInput({ onApply, currentCode }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const handleSubmit = async (e: React.FormEvent) => { /*...*/ };
  useEffect(() => { /*...*/ }, [currentCode, status]);


  return (
    // --- ИЗМЕНЕНИЯ ЗДЕСЯ ---
    // Белый фон, бордовая обводка, темный текст
    <div className="p-5 bg-white rounded-xl border border-burgundy-base/50 shadow-md">
      <label htmlFor="promo-code" className="flex items-center text-base font-semibold text-gray-900 mb-3">
        <Gift size={18} className="mr-2 text-burgundy-base opacity-90" /> {/* Иконка стала бордовой */}
        Промокод
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); if (status !== 'success' || e.target.value !== currentCode) { setStatus('idle'); setMessage(''); } }}
          placeholder="Есть промокод?"
          // Стиль инпута для светлой темы
          className="flex-grow px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy-base focus:border-transparent transition duration-200 disabled:opacity-60"
          disabled={status === 'loading' || status === 'success'}
        />
        {/* Кнопка бордовая */}
        <button
          type="submit"
          className="px-5 py-2 bg-burgundy-base hover:bg-burgundy-light border border-transparent text-white font-semibold rounded-lg shadow-button transition-colors duration-300 ease-in-out transform hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burgundy-lighter focus-visible:ring-offset-white"
          disabled={!code.trim() || status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'Применить'}
        </button>
      </form>
       {/* Сообщения остаются цветными */}
      {message && ( <div className={`mt-3 flex items-center text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}> {/* Чуть темнее цвета для контраста */}
          {status === 'success' && <CheckCircle size={16} className="mr-2 flex-shrink-0" />}
          {status === 'error' && <XCircle size={16} className="mr-2 flex-shrink-0" />}
          <span>{message}</span>
        </div>
      )}
    </div>
     // --- КОНЕЦ ИЗМЕНЕНИЙ ---
  );
}