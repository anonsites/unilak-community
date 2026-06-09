'use client';

import { useState } from 'react';
import DonationModal from './DonationModal';

export default function DonationCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative flex flex-col p-8 rounded-xl overflow-hidden bg-linear-to-br from-[#655c5c] to-[#38707a] border-[#2d3e1c33] shadow-xl border transition-transform hover:scale-[1.02]"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
        
        <h2 className="relative z-10 text-2xl font-extrabold text-white leading-tight mb-4">
          Have you found what you were looking for?
        </h2>
        
        {/*<p className="relative z-10 text-indigo-100 text-lg mb-6 leading-relaxed">
          Consider supporting us to keep this platform running and providing accurate class schedules for all students.
        </p>*/}

        <button
          onClick={() => setIsOpen(true)}
          className="relative z-10 w-full py-3 px-6 bg-blue-400 text-white font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
        >
          Yes
        </button>
      </div>

      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}