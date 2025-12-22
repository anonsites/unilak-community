'use client';

import { useState, useEffect } from 'react';

export default function DidYouKnowSlider({ facts }: { facts: string[] }) {
  const [visibleFacts, setVisibleFacts] = useState(facts);
  const [isExiting, setIsExiting] = useState(false);

  const dismissCard = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setVisibleFacts((prev) => prev.slice(1));
      setIsExiting(false);
    }, 300);
  };

  useEffect(() => {
    if (visibleFacts.length === 0) return;

    // Auto dismiss the top card after 5 minutes
    const timer = setTimeout(() => {
      dismissCard();
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [visibleFacts]);

  if (visibleFacts.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Background Card (Visual Stack) */}
      {visibleFacts.length > 1 && (
        <div className="absolute top-2 left-0 w-full h-full bg-gray-800 rounded-xl border border-gray-700 transform scale-[0.98] translate-y-2 -z-10 transition-all duration-300"></div>
      )}
      
      {/* Main Card */}
      <section className={`bg-gray-900 rounded-xl p-6 border border-gray-800 relative z-10 shadow-xl transition-all duration-300 ease-in-out ${
        isExiting ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-yellow-500 font-bold uppercase tracking-wide">DID YOU KNOW!</h2>
          <button 
            onClick={dismissCard}
            className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full"
            title="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-300 italic text-lg leading-relaxed">
          &quot;{visibleFacts[0]}&quot;
        </p>
        {visibleFacts.length > 1 && (
            <div className="mt-4 text-right text-xs text-gray-600 font-mono">
                +{visibleFacts.length - 1} more
            </div>
        )}
      </section>
    </div>
  );
}
