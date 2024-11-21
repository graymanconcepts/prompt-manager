import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onChange: (favorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  isFavorite, 
  onChange,
  size = 'md' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const getHeartColor = () => {
    if (isFavorite) {
      return 'fill-red-500 text-red-500 hover:fill-red-600 hover:text-red-600';
    }
    return isHovered ? 'text-red-400 hover:text-red-500' : 'text-gray-400 hover:text-red-400';
  };

  return (
    <button
      onClick={() => onChange(!isFavorite)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`focus:outline-none p-1.5 rounded-full hover:bg-gray-600/30 transition-all duration-200`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${sizeClasses[size]} ${getHeartColor()} transition-all duration-200`}
        strokeWidth={2}
      />
    </button>
  );
};

export default FavoriteButton;
