'use client';

import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmModalProps) {
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm rounded-full transition-colors border border-gray-700">
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              className={`px-5 py-2.5 font-bold text-sm rounded-full transition-colors text-white ${isDestructive ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}