import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập bình luận');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewAPI.createReview(productId, {
        rating,
        comment: comment.trim(),
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setHoveredRating(0);
      
      // Notify parent
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi đánh giá';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Đánh giá sản phẩm</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Đánh giá sao *</label>
          <div className="star-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Bình luận *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            rows={5}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

