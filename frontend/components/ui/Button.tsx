import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transform";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-indigo-800 focus:ring-primary shadow-soft hover:shadow-float hover:-translate-y-0.5",
    secondary: "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white hover:text-gray-900 focus:ring-gray-200 shadow-card hover:shadow-soft",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary bg-white/50 backdrop-blur-sm shadow-card hover:shadow-soft",
    ghost: "text-gray-600 hover:text-primary hover:bg-white/60 backdrop-blur-sm",
    danger: "bg-error text-white hover:bg-red-600 focus:ring-error shadow-soft hover:shadow-float hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};