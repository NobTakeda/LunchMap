import { useState } from 'react';

interface ShopFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (shop: ShopInput) => Promise<void>;
  onCancel: () => void;
}

export interface ShopInput {
  name: string;
  address: string;
  phone: string;
  url: string;
  latitude: number;
  longitude: number;
}

export default function ShopForm({ latitude, longitude, onSubmit, onCancel }: ShopFormProps) {
  const [formData, setFormData] = useState<ShopInput>({
    name: '',
    address: '',
    phone: '',
    url: '',
    latitude,
    longitude,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('店名を入力してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch {
      setError('お店の登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="shop-form-overlay">
      <form className="shop-form" onSubmit={handleSubmit}>
        <h3>新しいお店を登録</h3>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">店名 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="お店の名前"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">住所</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="東京都新宿区..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">電話番号</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="03-1234-5678"
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">HP URL</label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label>座標</label>
          <p className="coordinates">
            緯度: {latitude.toFixed(6)}, 経度: {longitude.toFixed(6)}
          </p>
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? '登録中...' : '登録する'}
          </button>
        </div>
      </form>
    </div>
  );
}
