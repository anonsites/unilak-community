'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function ReviewLinkWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/reviews');
  };

  return (
    <div onClickCapture={handleClick} className="cursor-pointer hover:opacity-90 transition-opacity">
      {children}
    </div>
  );
}