'use client'; // Карта работает только на клиенте

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IPickupPoint } from '@/types';

// Исправляем проблему с иконками Leaflet по умолчанию в сборщиках типа Webpack
// Можно также использовать кастомные иконки
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});


// Компонент для центрирования карты при изменении выбранной точки
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}


interface PickupPointMapProps {
  points: IPickupPoint[];
  selectedPointId: string | null;
  onMarkerClick: (id: string) => void;
  centerLat: number;
  centerLng: number;
  zoom?: number;
}

export default function PickupPointMap({
  points,
  selectedPointId,
  onMarkerClick,
  centerLat,
  centerLng,
  zoom = 12
}: PickupPointMapProps) {

  // Создаем кастомную иконку (можно сделать красивее)
  const defaultIcon = L.icon({
      iconUrl: markerIcon.src,
      iconRetinaUrl: markerIcon2x.src,
      shadowUrl: markerShadow.src,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  // Иконка для выделенного маркера (например, другого цвета - нужна своя SVG или PNG)
  const selectedIcon = L.icon({
      iconUrl: markerIcon.src, // ЗАМЕНИТЬ на иконку выделения
      iconRetinaUrl: markerIcon2x.src,
      shadowUrl: markerShadow.src,
      iconSize: [35, 58], // Чуть больше
      iconAnchor: [17, 58],
      popupAnchor: [1, -48],
      shadowSize: [58, 58]
  });


  const mapCenter: L.LatLngExpression = [centerLat, centerLng];

  // Центрируем карту на выбранной точке, если она есть
  const currentPoint = points.find(p => p.id === selectedPointId);
  const viewCenter: L.LatLngExpression = currentPoint ? [currentPoint.lat, currentPoint.lng] : mapCenter;
  const viewZoom = currentPoint ? 14 : zoom; // Увеличиваем зум при выборе


  // Leaflet требует рендеринга только на клиенте
   if (typeof window === 'undefined') {
     return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">Загрузка карты...</div>;
   }

  return (
    <MapContainer center={viewCenter} zoom={viewZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={viewCenter} zoom={viewZoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={point.id === selectedPointId ? selectedIcon : defaultIcon} // Разные иконки
          eventHandlers={{
            click: () => {
              onMarkerClick(point.id);
            },
          }}
        >
          <Popup>
            <div className="text-sm">
                <strong className="text-burgundy-base">{point.provider}</strong><br/>
                {point.name}<br/>
                <span className="text-xs text-gray-500">{point.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}