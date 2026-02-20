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
  // Hardcoded Red Theme (Rose) - Futuristic SaaS approach
  const variants = {
    primary: `bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:shadow-[0_0_30px_rgba(244,63,94,0.8)] border border-rose-500/50 font-bold transition-all`,
    secondary: `bg-transparent border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/70 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all font-semibold`,
    danger: 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all font-semibold',
    ghost: 'bg-transparent text-zinc-400 hover:text-white border border-transparent hover:bg-white/5 transition-all font-semibold',
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
        rounded-2xl uppercase tracking-wider font-display micro-hover
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
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
