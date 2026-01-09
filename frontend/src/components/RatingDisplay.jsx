import React from 'react';
import './RatingDisplay.css';

const RatingDisplay = ({ rating = 0, reviewCount = 0, completedOrderCount = 0, showPurchaseCount = true }) => {
  // Làm tròn rating đến 1 chữ số thập phân
  const roundedRating = Math.round(rating * 10) / 10;
  
  // Tính số sao đầy, nửa sao, và sao rỗng
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="rating-display">
      <div className="rating-stars">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star star-full">★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span className="star star-half">★</span>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star star-empty">★</span>
        ))}
      </div>
      <div className="rating-info">
        <span className="rating-text">
          ({reviewCount} đánh giá
          {showPurchaseCount && completedOrderCount > 0 && ` / ${completedOrderCount} lượt mua`})
        </span>
      </div>
    </div>
  );
};

export default RatingDisplay;

