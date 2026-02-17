import React from 'react';
import { useGame } from '../../context/GameContext';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  const { themeMode } = useGame();
  
  return (
    <div 
      className={`
        relative card-hover
        ${themeMode === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/5'}
        backdrop-blur-xl border 
        ${noPadding ? '' : 'p-8'} 
        rounded-3xl shadow-2xl
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;