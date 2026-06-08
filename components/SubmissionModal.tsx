'use client';

import { useState, useEffect } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, phoneNumber: string) => Promise<void>;
  loading: boolean;
}

export default function SubmissionModal({ isOpen, onClose, onSubmit, loading }: SubmissionModalProps) {
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setPhoneNumber('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) return;
    
    await onSubmit(description, phoneNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end pointer-events-none p-4 md:p-8">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full md:max-w-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300 pointer-events-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-white mb-8 tracking-tight ">Complete your request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="description" className="block text-lg font-medium text-white">Describe your announcement</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 resize-none"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-lg font-medium text-white">Phone number (Whatsapp)</label>
            <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:placeholder-gray-600 [&_.PhoneInputCountryIcon]:h-6 [&_.PhoneInputCountryIcon]:w-auto [&_.PhoneInputCountrySelect]:text-black">
              <PhoneInput
                id="phone"
                international
                defaultCountry="RW"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || '')}
                placeholder="Enter phone number"
              />
            </div>
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <p className="text-red-400 text-xs">Please enter a valid phone number</p>
            )}
            <p className="text-sm text-white/80">We review your announcement before it goes live.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim() || !!(phoneNumber && !isValidPhoneNumber(phoneNumber))}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black tracking-widest transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center uppercase"
          >
            {loading ? 'Submitting...' : 'Submit Now'}
          </button>
        </form>
      </div>
    </div>
  );
}