import React from 'react';
import { IPickupPoint } from '@/types';
import PickupPointListItem from './PickupPointListItem';

interface PickupPointListProps {
  points: IPickupPoint[];
  selectedPointId: string | null;
  onSelect: (point: IPickupPoint) => void;
  onHover: (id: string | null) => void; // Для подсветки на карте при наведении
}

export default function PickupPointList({ points, selectedPointId, onSelect, onHover }: PickupPointListProps) {
  return (
    <div className="space-y-3">
      {points.length > 0 ? (
        points.map((point) => (
          <PickupPointListItem
            key={point.id}
            point={point}
            isSelected={point.id === selectedPointId}
            onSelect={() => onSelect(point)}
            onMouseEnter={() => onHover(point.id)}
            onMouseLeave={() => onHover(null)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-8">Нет доступных пунктов самовывоза.</p>
      )}
    </div>
  );
}