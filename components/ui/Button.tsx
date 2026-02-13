import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  active = false,
  ...props 
}) => {
  
  // Hardcoded Red Theme (Rose)
  const variants = {
    primary: `bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border-transparent font-semibold`,
    secondary: `bg-transparent border border-rose-500/50 text-rose-500 hover:bg-rose-500/10`,
    danger: 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:bg-zinc-200 dark:hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const activeClass = active ? `border-rose-500 text-rose-400 bg-rose-500/10` : '';

  return (
    <button
      className={`
        relative overflow-hidden transition-all duration-300 ease-out 
        rounded-2xl uppercase tracking-wider font-display
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${activeClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
