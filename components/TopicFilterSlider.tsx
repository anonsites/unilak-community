'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface Topic {
  id: number | string;
  name: string;
}

interface TopicFilterSliderProps {
  topics: Topic[];
  selectedTopicId?: string;
}

export default function TopicFilterSlider({ topics, selectedTopicId }: TopicFilterSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // Use a small tolerance for float precision
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [topics]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 p-2 rounded-full shadow-lg border border-gray-700 text-white hover:bg-blue-600 transition-all duration-300 ${
          showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
        aria-label="Scroll left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto space-x-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <Link
          href="/reviews"
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border flex-shrink-0 ${
            !selectedTopicId
              ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-lg shadow-blue-500/25'
              : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          ALL
        </Link>
        {topics?.map((topic) => (
          <Link
            key={topic.id}
            href={`/reviews?topic=${topic.id}`}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border flex-shrink-0 ${
              selectedTopicId === topic.id.toString()
                ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-lg shadow-blue-500/25'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {topic.name.toUpperCase()}
          </Link>
        ))}
        {/* Spacer to ensure last item isn't hidden behind right arrow on small screens if scrolled fully */}
        <div className="w-8 flex-shrink-0 md:hidden opacity-0">.</div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 p-2 rounded-full shadow-lg border border-gray-700 text-white hover:bg-blue-600 transition-all duration-300 ${
          showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
        aria-label="Scroll right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      
      {/* Gradient Fade for visual cue */}
      <div className={`absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}