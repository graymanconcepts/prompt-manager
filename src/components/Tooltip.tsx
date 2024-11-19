import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap ${positionClasses[position]}`}
          role="tooltip"
        >
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 
              ${position === 'top' ? 'top-full -translate-y-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'bottom-full translate-y-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'left-full -translate-x-1 top-1/2 -translate-y-1/2' : ''}
              ${position === 'right' ? 'right-full translate-x-1 top-1/2 -translate-y-1/2' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
