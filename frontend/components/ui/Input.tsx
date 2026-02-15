import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={`block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20 sm:text-base transition-all duration-200 ${icon ? 'pl-11' : ''} ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>}
    </div>
  );
};