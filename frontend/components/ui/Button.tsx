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
    primary: "bg-primary text-primary-foreground hover:opacity-90 focus:ring-ring shadow-soft hover:shadow-float hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 focus:ring-ring shadow-card hover:shadow-soft",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-ring bg-card shadow-card hover:shadow-soft",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/50 shadow-soft hover:shadow-float hover:-translate-y-0.5",
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