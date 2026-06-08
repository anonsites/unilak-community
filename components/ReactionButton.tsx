'use client';

import { useState } from 'react';

interface ReactionButtonProps {
  emoji: string;
  count: number;
  isActive: boolean;
  onToggle: (emoji: string) => Promise<void>;
  disabled?: boolean;
}

export default function ReactionButton({ 
  emoji, 
  count, 
  isActive, 
  onToggle,
  disabled = false 
}: ReactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle(emoji);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded-full transition-all
        border border-gray-700 hover:border-gray-600
        ${isActive 
          ? 'bg-gray-700 text-white' 
          : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-750'
        }
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        text-sm font-medium
      `}
      title={`React with ${emoji}`}
    >
      <span className="text-base">{emoji}</span>
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
