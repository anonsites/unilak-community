'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FloatingAddButtonProps {
  href: string;
}

export default function FloatingAddButton({ href }: FloatingAddButtonProps) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Collapse button if scrolled more than 50px
      setIsCompact(window.scrollY > 50);
    };

    // Check initial position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

   return (
   <Link
      href={href}
      className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-105 z-50 flex items-center justify-center overflow-hidden ${
        isCompact ? 'w-12 h-12 rounded-full' : 'px-6 py-3 rounded-full'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
      <span 
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isCompact ? 'max-w-0 opacity-0 ml-0' : 'max-w-[140px] opacity-100 ml-2'
        }`}
      >
        WRITE REVIEW
      </span>
    </Link>
  );
}
