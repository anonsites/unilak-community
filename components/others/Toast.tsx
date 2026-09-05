'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${
      type === 'success' 
        ? 'bg-green-900/90 border-green-500 text-green-100' 
        : 'bg-red-900/90 border-red-500 text-red-100'
    }`}>
      <span className="text-xl">{type === 'success' ? '\u2714' : '\u2718'}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}