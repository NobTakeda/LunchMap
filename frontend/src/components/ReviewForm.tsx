import { useState } from 'react';
import { ReviewInput } from '../types';
import { createReview } from '../api/client';

interface ReviewFormProps {
  shopId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ shopId, onReviewAdded }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewInput>({
    reviewer: '',
    visitCount: 1,
    priceRating: 3,
    tasteRating: 3,
    atmosphereRating: 3,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reviewer.trim()) {
      setError('名前を入力してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createReview(shopId, formData);
      setFormData({
        reviewer: '',
        visitCount: 1,
        priceRating: 3,
        tasteRating: 3,
        atmosphereRating: 3,
        comment: '',
      });
      onReviewAdded();
    } catch {
      setError('レビューの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'reviewer' || name === 'comment' ? value : parseInt(value, 10),
    }));
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>レビューを投稿</h3>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="reviewer">名前</label>
        <input
          type="text"
          id="reviewer"
          name="reviewer"
          value={formData.reviewer}
          onChange={handleChange}
          placeholder="あなたの名前"
        />
      </div>

      <div className="form-group">
        <label htmlFor="visitCount">来店回数</label>
        <input
          type="number"
          id="visitCount"
          name="visitCount"
          value={formData.visitCount}
          onChange={handleChange}
          min="1"
        />
      </div>

      <div className="form-group">
        <label htmlFor="priceRating">値段 (1-5)</label>
        <select
          id="priceRating"
          name="priceRating"
          value={formData.priceRating}
          onChange={handleChange}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tasteRating">味 (1-5)</label>
        <select
          id="tasteRating"
          name="tasteRating"
          value={formData.tasteRating}
          onChange={handleChange}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="atmosphereRating">雰囲気 (1-5)</label>
        <select
          id="atmosphereRating"
          name="atmosphereRating"
          value={formData.atmosphereRating}
          onChange={handleChange}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="comment">コメント</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="感想を書いてください..."
        />
      </div>

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? '投稿中...' : 'レビューを投稿'}
      </button>
    </form>
  );
}
