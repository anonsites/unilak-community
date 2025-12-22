'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 p-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-gray-300 text-sm leading-relaxed max-w-3xl">
          <p>
            We use cookies to improve your experience on UNILAK Community. By continuing to browse, you agree to our use of cookies.
            For more information, please read our <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex gap-4 shrink-0 w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none bg-transparent hover:bg-white/5 text-gray-400 border border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
