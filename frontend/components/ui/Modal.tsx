import React, { Fragment } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl text-left shadow-lift transition-all sm:my-8 sm:w-full sm:max-w-lg border border-white/50">
          <div className="bg-gradient-to-br from-white/90 to-gray-50/80 backdrop-blur-sm px-6 pb-4 pt-6 sm:p-8 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold leading-6 text-gray-900 font-display">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100/80 transition-all text-gray-400 hover:text-gray-600 backdrop-blur-sm"
              >
                <X size={22} />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
          {footer && (
            <div className="bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 border-t border-white/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};