import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const Rating: React.FC<RatingProps> = ({ 
  value = 0, 
  onChange, 
  count = 0,
  size = 'md',
  readonly = false
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const stars = [1, 2, 3, 4, 5];
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      // If clicking the same rating again, clear it
      onChange(rating === value ? 0 : rating);
    }
  };

  const getStarColor = (star: number) => {
    const rating = hoverValue ?? value;
    if (star <= rating) {
      return readonly 
        ? 'fill-yellow-400 text-yellow-400' 
        : 'fill-yellow-400 text-yellow-400 hover:fill-yellow-500 hover:text-yellow-500';
    }
    return readonly
      ? 'text-gray-400'
      : 'text-gray-400 hover:text-yellow-400 hover:fill-yellow-400';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((star) => (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded ${
              readonly ? 'cursor-default' : 'cursor-pointer'
            }`}
            disabled={readonly}
            title={readonly ? `${value} stars` : `Rate ${star} stars`}
          >
            <Star
              className={`${sizeClasses[size]} ${getStarColor(star)} transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      {count > 0 && (
        <span className="text-sm text-gray-400 ml-1" title={`${count} rating${count !== 1 ? 's' : ''}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
