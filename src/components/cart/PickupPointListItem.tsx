import React from 'react';
import { IPickupPoint } from '@/types';
import { Clock, MapPin } from 'lucide-react';

interface PickupPointListItemProps {
  point: IPickupPoint;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function PickupPointListItem({
  point,
  isSelected,
  onSelect,
  onMouseEnter,
  onMouseLeave
}: PickupPointListItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-burgundy-base/10 border-burgundy-base shadow-md'
          : 'bg-white border-gray-200 hover:border-burgundy-base/50 hover:shadow-sm'
      }`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-grow">
          <p className="text-sm font-semibold text-gray-900">
            {point.provider} - {point.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
             <MapPin size={12} className="flex-shrink-0"/> {point.address}
          </p>
          {point.hours && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock size={12} className="flex-shrink-0"/> {point.hours}
            </p>
          )}
        </div>
        {/* Можно скрыть кнопку, если элемент уже выбран */}
        {!isSelected && (
           <button
             onClick={(e) => { e.stopPropagation(); onSelect(); }} // Предотвращаем всплытие на div
             className="ml-2 mt-1 px-3 py-1 text-xs bg-burgundy-base hover:bg-burgundy-light text-white font-medium rounded-md shadow-sm transition-colors whitespace-nowrap"
            >
             Выбрать
           </button>
        )}

      </div>
      {point.distance && (
        <p className="text-right text-xs text-gray-400 mt-1">~ {point.distance}</p>
      )}
    </div>
  );
}