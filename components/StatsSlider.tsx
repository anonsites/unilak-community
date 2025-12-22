'use client';

import { useEffect, useState } from 'react';

interface StatsSliderProps {
  label: string;
  count?: number;
  percentage?: number;
  colorClass: string;
  textColorClass: string;
  loading?: boolean;
}

export default function StatsSlider({ 
  label, 
  count = 0, 
  percentage = 0, 
  colorClass, 
  textColorClass,
  loading = false
}: StatsSliderProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (loading) return;

    // 1. Animate the bar width (delay slightly to allow render)
    const widthTimer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);

    // 2. Animate the number count
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic: 1 - (1 - x)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setDisplayCount(Math.floor(ease * count));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => clearTimeout(widthTimer);
  }, [count, percentage, loading]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className={`font-bold text-sm tracking-widest ${textColorClass}`}>{label}</span>
        {loading ? (
          <div className="h-7 w-16 bg-gray-800 rounded animate-pulse" />
        ) : (
          <span className={`font-bold text-xl ${textColorClass}`}>{displayCount}</span>
        )}
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        {loading ? (
          <div className="h-full w-full bg-gray-700 animate-pulse" />
        ) : (
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${displayPercentage}%` }}
          />
        )}
      </div>
    </div>
  );
}