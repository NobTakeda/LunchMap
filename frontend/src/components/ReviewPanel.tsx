import { useState, useEffect } from 'react';
import { Shop, Review } from '../types';
import { getReviews } from '../api/client';
import ReviewForm from './ReviewForm';

interface ReviewPanelProps {
  shop: Shop | null;
  onReviewAdded: () => void;
}

export default function ReviewPanel({ shop, onReviewAdded }: ReviewPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      fetchReviews();
    }
  }, [shop]);

  const fetchReviews = async () => {
    if (!shop) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getReviews(shop.id);
      setReviews(data || []);
    } catch (err) {
      setError('レビューの取得に失敗しました');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    fetchReviews();
    onReviewAdded();
  };

  const calculateOverallRating = (review: Review) => {
    const total = review.priceRating + review.tasteRating + review.atmosphereRating;
    const max = 15;
    return ((total / max) * 100).toFixed(0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP');
  };

  if (!shop) {
    return (
      <div className="review-panel">
        <div className="no-selection">
          <p>地図上のマーカーをクリックして</p>
          <p>お店の情報を表示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-panel">
      <div className="shop-info">
        <h3>{shop.name}</h3>
        <p>{shop.address}</p>
        {shop.phone && <p>TEL: {shop.phone}</p>}
        {shop.url && (
          <p>
            <a href={shop.url} target="_blank" rel="noopener noreferrer">
              お店のHP
            </a>
          </p>
        )}
      </div>

      <h2>レビュー</h2>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">まだレビューがありません</div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <span className="reviewer">{review.reviewer}</span>
              <span className="visit-count">来店: {review.visitCount}回</span>

              <div className="ratings">
                <div className="rating-item">
                  <span className="rating-label">値段:</span>
                  <span className="rating-value">{review.priceRating}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">味:</span>
                  <span className="rating-value">{review.tasteRating}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">雰囲気:</span>
                  <span className="rating-value">{review.atmosphereRating}/5</span>
                </div>
              </div>

              <div className="overall-rating">
                総合: {calculateOverallRating(review)}%
              </div>

              {review.comment && (
                <div className="comment">{review.comment}</div>
              )}

              <div className="date">{formatDate(review.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      <ReviewForm shopId={shop.id} onReviewAdded={handleReviewAdded} />
    </div>
  );
}
