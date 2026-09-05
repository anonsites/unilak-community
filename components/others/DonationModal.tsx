'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

const AMOUNTS = [
  { label: '2K', value: 2000 },
  { label: '5K', value: 5000 },
  { label: '8K', value: 8000 },
  { label: '10K', value: 10000 },
];

export default function DonationModal({ isOpen, onClose, onContinue }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);

  if (!isOpen) return null;

  const handleDonate = () => {
    // Prefilled USSD: *182*8*1*387483* (amount selected)#
    const ussd = `*182*8*1*387483*${selectedAmount}#`;
    // Use tel: API with URL encoding for the # character
    window.location.href = `tel:${ussd.replace('#', '%23')}`;
    
    // Proceed with the flow after a short delay
    if (onContinue) {
      setTimeout(onContinue, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#655c5c] to-[#38707a] border border-[#2d3e1c33] rounded-[2.5rem] p-8 md:p-12 w-full max-w-sm md:max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Side: Devs & Story */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <div className="flex items-center -space-x-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#846363] overflow-hidden bg-gray-800 shadow-2xl">
                <Image src="/images/dev1-profile.png" alt="Developer" width={128} height={128} className="object-cover" />
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#846363] overflow-hidden bg-gray-700 shadow-2xl">
                <Image src="/images/dev2-profile.png" alt="Developer" width={128} height={128} className="object-cover" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Support us</h2>
              <p className="text-white text-lg leading-relaxed">
                We are two students dedicated to keeping this platform running. Your donation covers costs and keeps the community alive.
              </p>
            </div>
          </div>

          {/* Right Side: Amounts & CTA */}
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {AMOUNTS.map((amt) => (
                <button
                  key={amt.value}
                  onClick={() => setSelectedAmount(amt.value)}
                  className={`py-3 md:py-4 rounded-2xl font-bold transition-all duration-200 border-2 ${
                    selectedAmount === amt.value 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-[1.02]' 
                    : 'bg-white/10 border-white/5 text-white hover:bg-white/15'
                  }`}
                >
                  {amt.label}
                  <span className="block text-[10px]  font-normal">RWF</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleDonate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-2xl font-black tracking-widest transition-all duration-200 shadow-lg active:scale-95 text-base flex items-center justify-center gap-2 uppercase"
              >
                <Image src="/images/mtn-icon.png" alt="MTN Icon" width={32} height={32} className="rounded-lg" />
                <span>Donate Now</span>
              </button>
              <button 
                onClick={onContinue || onClose} 
                className="w-full bg-white/10 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}