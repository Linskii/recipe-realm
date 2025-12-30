import React, { useState } from 'react';

export default function StarRating({
  rating,
  onRate,
  readonly = false,
  size = 'md',
  showCount = false,
  ratingCount = 0
}) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = (starValue) => {
    if (!readonly && onRate) {
      onRate(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!readonly) {
      setHoveredStar(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(0);
    }
  };

  const displayRating = hoveredStar || rating || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 rounded
              ${!readonly && 'active:scale-95'}`}
            aria-label={`Rate ${starValue} stars`}
          >
            <svg
              className={`${sizeClasses[size]} transition-colors duration-150`}
              fill={starValue <= displayRating ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={starValue <= displayRating ? 0 : 2}
              viewBox="0 0 24 24"
              style={{
                color: starValue <= displayRating ? '#FCD34D' : '#D1D5DB',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>

      {!readonly && hoveredStar > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          {hoveredStar} {hoveredStar === 1 ? 'star' : 'stars'}
        </span>
      )}

      {readonly && showCount && ratingCount > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
