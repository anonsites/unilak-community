'use client';

import { useState, useEffect } from 'react';

interface FAQItemProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  viewCount?: number;
}

export default function FAQItem({
  id,
  question,
  answer,
  category,
  viewCount = 0,
}: FAQItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayViewCount, setDisplayViewCount] = useState(viewCount);

  useEffect(() => {
    if (isExpanded) {
      // Track view when FAQ is expanded
      const trackView = async () => {
        try {
          const response = await fetch(`/api/faq/${id}/view`, {
            method: 'POST',
          });
          if (response.ok) {
            const data = await response.json();
            setDisplayViewCount(data.view_count || displayViewCount + 1);
          }
        } catch (error) {
          console.error('Error tracking FAQ view:', error);
        }
      };
      
      trackView();
    }
  }, [isExpanded, id, displayViewCount]);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    General: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    Classes: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    'Students life': { bg: 'bg-pink-500/20', text: 'text-pink-400' },
    Rules: { bg: 'bg-green-500/20', text: 'text-green-400' },
    Others: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };

  const colors = categoryColors[category] || categoryColors.General;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900 overflow-hidden hover:border-gray-600 transition-colors group">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left hover:bg-gray-800/50 transition-colors flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded ${colors.bg} ${colors.text} border border-current/20`}
            >
              {category}
            </span>
            {viewCount > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.107.424.107.639a1.012 1.012 0 0 1-.1.639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178a1.02 1.02 0 0 1-.037-.639Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                {displayViewCount}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {question}
          </h3>
        </div>

        <div className="pt-1 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-5 h-5 text-white transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/30">
          <div className="prose prose-invert max-w-none">
            <p className="text-white/80 text-lg whitespace-pre-wrap leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
