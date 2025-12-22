'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { submitReport } from '@/app/reviews/actions';
import Toast from './Toast';

interface ReportModalProps {
  reviewId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Say it as it is (Truthfulness)",
  "Disrespectful or offensive language",
  "Exposes personal information",
  "Fake, fraud, scam, or spam content",
  "Other violation of community rules"
];

export default function ReportModal({ reviewId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReport(reviewId, reason);
      setToast({ message: 'Report submitted. Thank you.', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to submit report';
      setToast({ message: errorMessage, type: 'error' });
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">Report Review</h2>
          <p className="text-gray-400 text-sm mb-6">
            Help us keep the community safe. Why are you reporting this review?
          </p>

          <div className="space-y-3 mb-8">
            {REPORT_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-600 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300 text-sm">{r}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold text-sm transition-colors" disabled={submitting}>
              CANCEL
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-full transition-colors disabled:opacity-50">
              {submitting ? 'SENDING...' : 'REPORT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}