'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DirectionSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="text-center">
      <div className="group inline-flex flex-wrap justify-center items-center gap-x-4 gap-y-2 p-2 border-2 border-orange-400 rounded-xl bg-gray-900/30 backdrop-blur-sm tracking-wider">


        <div 
          className="text-sm md:text-base font-bold text-gray-200" 
        >
          <Link href="/reviews" className="hover:text-blue-400 transition-colors">ASK</Link> <span className={`transition-opacity duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>&gt;</span>
        </div>

        <div 
          className="text-sm md:text-base font-bold text-gray-200" 
        >
          <Link href="/reviews" className="hover:text-blue-400 transition-colors">CLAIM</Link> <span className={`transition-opacity duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>&gt;</span>
        </div>

        <div 
          className="hover:animate-bounce" 
        >
          <Link href="/reviews" className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-5 rounded-full transition-all shadow-md inline-block text-xs md:text-sm font-bold">REVIEW</Link>
        </div>

      </div>
    </section>
  );
}