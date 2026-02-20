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
        ${themeMode === 'dark' ? 'bg-white/[0.02] border-white/10 shadow-[0_0_30px_rgba(244,63,94,0.05)]' : 'bg-white/80 border-black/5 shadow-[0_0_30px_rgba(0,0,0,0.05)]'}
        backdrop-blur-2xl border 
        ${noPadding ? '' : 'p-8'} 
        rounded-[2rem]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;