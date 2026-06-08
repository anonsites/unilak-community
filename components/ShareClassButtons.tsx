'use client';

import { useState } from 'react';

interface ShareClassButtonsProps {
  classId: string;
  courseName: string;
}

export default function ShareClassButtons({ classId, courseName }: ShareClassButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareText = `Check out this class: ${courseName} at UNILAK.`;

  const copyLink = async () => {
    const url = `${window.location.origin}/find-classes/${classId}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/find-classes/${classId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = `${window.location.origin}/find-classes/${classId}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="mt-8 border-t border-white/5 pt-8">
      <h2 className="text-xl font-extrabold text-white">Share with your friend.</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
        >
          {isCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-500">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Copy link
            </>
          )}
        </button>

        <button
          onClick={shareOnWhatsApp}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-500">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z" />
          </svg>
          WhatsApp
        </button>
      </div>
    </div>
  );
}