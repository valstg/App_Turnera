import React, { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const totalStars = 5;

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const handleClick = (index: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(index + 1);
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave}>
      {[...Array(totalStars)].map((_, index) => {
        const currentRating = hoverRating || rating;
        const isSolid = index < currentRating;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            disabled={readOnly}
            className={`transition-colors duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${isSolid ? 'text-yellow-400' : 'text-gray-300'} ${!readOnly && isSolid ? 'hover:text-yellow-300' : ''} ${!readOnly && !isSolid ? 'hover:text-yellow-300' : ''}`}
            aria-label={`Rate ${index + 1} out of ${totalStars}`}
          >
            <StarIcon solid={isSolid} className={sizeClasses[size]} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
