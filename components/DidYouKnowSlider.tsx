'use client';

import { useState, useEffect } from 'react';

export default function DidYouKnowSlider({ facts }: { facts: string[] }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (facts.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setFade(true); // Start fade in
      }, 500); // Duration of fade out (matches CSS transition)
    }, 60000); // Time between slides (1 minute)

    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-yellow-500 font-bold mb-3 uppercase tracking-wide">DID YOU KNOW!</h2>
      <p className={`text-gray-300 italic transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        &quot;{facts[index]}&quot;
      </p>
    </section>
  );
}