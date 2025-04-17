import React, { useState, useEffect, useMemo } from 'react'; // Добавляем useMemo для оптимизации фильтрации
import { X, Search } from 'lucide-react'; // Добавляем иконку Search
import { IPickupPoint } from '@/types';
import PickupPointMap from './PickupPointMap';
import PickupPointList from './PickupPointList';

interface PickupPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: IPickupPoint[];
  onSelectPoint: (point: IPickupPoint) => void;
  // isLoading?: boolean; // Можно раскомментировать, если передаем флаг загрузки
}

export default function PickupPointModal({
  isOpen,
  onClose,
  points,
  onSelectPoint,
  // isLoading = false
}: PickupPointModalProps) {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // <--- Состояние для поискового запроса

  useEffect(() => {
    if (!isOpen) {
      setSelectedPointId(null);
      setSearchQuery(''); // Сбрасываем поиск при закрытии
    }
  }, [isOpen]);

  // Фильтрация списка пунктов на основе searchQuery
  // useMemo кэширует результат, чтобы не фильтровать на каждый рендер
  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) {
      return points; // Если поиск пустой, показываем все
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return points.filter(point =>
      point.name.toLowerCase().includes(lowerCaseQuery) ||
      point.address.toLowerCase().includes(lowerCaseQuery) ||
      point.provider.toLowerCase().includes(lowerCaseQuery)
    );
  }, [points, searchQuery]); // Пересчитываем только если изменился список или запрос

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Выберите пункт самовывоза</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Закрыть окно"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- ПОЛЕ ПОИСКА --- */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, адресу или сети..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-base/50 focus:border-transparent"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
        {/* --- КОНЕЦ ПОЛЯ ПОИСКА --- */}

        {/* Основной контент: Карта и Список */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Карта */}
          <div className="w-full md:w-1/2 h-64 md:h-auto flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200">
            <PickupPointMap
                // Передаем отфильтрованные точки на карту (опционально, можно передавать 'points' для показа всех)
                points={filteredPoints}
                selectedPointId={selectedPointId}
                onMarkerClick={(id) => setSelectedPointId(id)}
                centerLat={56.9496} // Центр Риги (пример)
                centerLng={24.1052}
                zoom={12}
             />
          </div>

          {/* Список */}
          <div className="w-full md:w-1/2 overflow-y-auto p-4 bg-gray-50">
            {/* Показываем спиннер или сообщение во время загрузки (если нужно) */}
            {/* {isLoading ? <p>Загрузка...</p> : ( */}
            <PickupPointList
              // Передаем отфильтрованные точки в список
              points={filteredPoints}
              selectedPointId={selectedPointId}
              onSelect={(point) => {
                  onSelectPoint(point);
              }}
              onHover={(id) => setSelectedPointId(id)}
            />
            {/* )} */}
          </div>
        </div>
      </div>
      {/* ... анимация ... */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}