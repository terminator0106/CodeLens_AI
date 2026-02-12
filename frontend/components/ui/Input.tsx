import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-base transition-all duration-200 ${icon ? 'pl-11' : ''} ${error ? 'border-error focus:border-error focus:ring-error/10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-error font-medium">{error}</p>}
    </div>
  );
};