import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LeafletMouseEvent } from 'leaflet';
import { Shop } from '../types';

interface MapProps {
  shops: Shop[];
  onShopSelect: (shop: Shop) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isAddMode: boolean;
}

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 大ガード交差点
const CENTER: [number, number] = [35.6945, 139.7003];
const ZOOM = 16;

function MapClickHandler({ onMapClick, isAddMode }: { onMapClick?: (lat: number, lng: number) => void; isAddMode: boolean }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      if (isAddMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({ shops, onShopSelect, onMapClick, isAddMode }: MapProps) {
  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      className="map-container"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} isAddMode={isAddMode} />
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.latitude, shop.longitude]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => onShopSelect(shop),
          }}
        >
          <Popup>
            <strong>{shop.name}</strong>
            <br />
            {shop.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
