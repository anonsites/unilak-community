'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const slides = [
  '/singles/single1.jpg',
  '/singles/single2.jpg',
  '/singles/single3.jpg',
  '/singles/single4.jpg',
];

export default function AdvertToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 5000);
    const rotateTimer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 2500);

    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(rotateTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="https://vibegream-dating.vercel.app/indaya"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-50 block w-80 max-w-[90vw] rounded-2xl border border-white/10 bg-gray-900/95 p-3 shadow-2xl text-white backdrop-blur-sm animate-in slide-in-from-right duration-300"
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white shadow-md"
        aria-label="Close advert"
      >
        ×
      </button>

      <div className="overflow-hidden rounded-xl border-2 border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.25)]">
        <Image
          key={slides[activeIndex]}
          src={slides[activeIndex]}
          alt="Featured singles ad"
          width={320}
          height={480}
          className="h-72 w-full object-cover object-center transition-all duration-700 ease-out animate-[zoomIn_0.7s_ease-out]"
        />
      </div>

      <div className="mt-3 space-y-2">
        <h3 className="text-xl font-semibold leading-tight text-white">
          Feeling bored..
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">
            Meet singles in your area
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20">
            →
          </span>
        </div>
      </div>
    </a>
  );
}
