import { useState, useEffect } from 'react';
import Map from './components/Map';
import ReviewPanel from './components/ReviewPanel';
import ShopForm from './components/ShopForm';
import { Shop } from './types';
import { getShops, createShop, ShopInput } from './api/client';

export default function App() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newShopLocation, setNewShopLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchShops = async () => {
    try {
      const data = await getShops();
      setShops(data || []);
      setError(null);
    } catch {
      setError('店舗データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleShopSelect = (shop: Shop) => {
    if (!isAddMode) {
      setSelectedShop(shop);
    }
  };

  const handleReviewAdded = () => {
    // レビュー追加後に必要であれば再読み込み
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddMode) {
      setNewShopLocation({ lat, lng });
    }
  };

  const handleAddModeToggle = () => {
    setIsAddMode(!isAddMode);
    setNewShopLocation(null);
    if (!isAddMode) {
      setSelectedShop(null);
    }
  };

  const handleShopSubmit = async (shopData: ShopInput) => {
    await createShop(shopData);
    await fetchShops();
    setNewShopLocation(null);
    setIsAddMode(false);
  };

  const handleShopFormCancel = () => {
    setNewShopLocation(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{ margin: 'auto', padding: '20px' }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <button
        className={`add-shop-btn ${isAddMode ? 'active' : ''}`}
        onClick={handleAddModeToggle}
      >
        {isAddMode ? 'キャンセル' : '+ お店を追加'}
      </button>

      {isAddMode && !newShopLocation && (
        <div className="add-mode-hint">
          地図をクリックしてお店の場所を選択してください
        </div>
      )}

      <Map
        shops={shops}
        onShopSelect={handleShopSelect}
        onMapClick={handleMapClick}
        isAddMode={isAddMode}
      />

      <ReviewPanel shop={selectedShop} onReviewAdded={handleReviewAdded} />

      {newShopLocation && (
        <ShopForm
          latitude={newShopLocation.lat}
          longitude={newShopLocation.lng}
          onSubmit={handleShopSubmit}
          onCancel={handleShopFormCancel}
        />
      )}
    </div>
  );
}
