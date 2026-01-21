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
  const baseStyles = "px-6 py-3 font-bold text-lg border-2 border-black rounded-xl transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  
  const variants = {
    primary: "bg-[#FF9A9E] hover:bg-[#ff858a] text-white",
    secondary: "bg-[#A1C4FD] hover:bg-[#8eb6fc] text-white",
    danger: "bg-red-400 hover:bg-red-500 text-white"
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