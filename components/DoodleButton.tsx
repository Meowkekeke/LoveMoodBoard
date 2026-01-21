import React from 'react';

interface DoodleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const DoodleButton: React.FC<DoodleButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 font-bold text-xl border-4 border-black rounded-2xl transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-wide";
  
  const variants = {
    // Green Theme
    primary: "bg-[#86efac] hover:bg-[#4ade80] text-black", // Green-300 to Green-400
    // Yellow/Sunny Theme
    secondary: "bg-[#fde047] hover:bg-[#facc15] text-black", // Yellow-300 to Yellow-400
    danger: "bg-[#fca5a5] hover:bg-[#f87171] text-black" // Red-300 to Red-400
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};