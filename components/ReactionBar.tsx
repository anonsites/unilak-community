'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactionButton from './ReactionButton';
import { ReviewWithRelations } from '@/lib/types';

interface ReactionBarProps {
  review: ReviewWithRelations;
  currentUserId?: string;
  onReactionsChange?: (reactions: Record<string, number>) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '😂', '😮', '😢'];

export default function ReactionBar({ 
  review, 
  currentUserId,
  onReactionsChange 
}: ReactionBarProps) {
  const [reactionsCount, setReactionsCount] = useState<Record<string, number>>(
    review.reactions_count || {}
  );
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load reactions on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        setIsAuthLoading(true);
        const response = await fetch(`/api/reviews/${review.id}/reactions`, {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, that's fine
            setUserReactions(new Set());
          } else {
            console.error('Failed to load reactions');
            setError('Failed to load reactions');
          }
        } else {
          const data = await response.json();
          setReactionsCount(data.reactions_count || {});
          setUserReactions(new Set(data.user_reactions || []));
        }
      } catch (error) {
        console.error('Error loading reactions:', error);
        setError('Failed to load reactions');
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadReactions();
  }, [review.id]);

  const handleToggleReaction = async (emoji: string) => {
    // Check if user is authenticated
    if (!currentUserId) {
      // Redirect to login
      router.push('/auth?redirect=/reviews');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${review.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji_type: emoji }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth?redirect=/reviews');
          return;
        }
        throw new Error('Failed to toggle reaction');
      }

      const data = await response.json();
      
      // Update local state
      setReactionsCount(data.reactions_count);
      
      // Update user reactions
      if (data.action === 'added') {
        setUserReactions(prev => new Set([...prev, emoji]));
      } else {
        setUserReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(emoji);
          return newSet;
        });
      }

      // Notify parent component
      if (onReactionsChange) {
        onReactionsChange(data.reactions_count);
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
      setError('Failed to update reaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {EMOJI_OPTIONS.map(emoji => (
          <div
            key={emoji}
            className="h-8 w-16 bg-gray-800 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {error && (
        <div className="text-xs text-red-400 w-full">
          {error}
        </div>
      )}
      {EMOJI_OPTIONS.map(emoji => (
        <ReactionButton
          key={emoji}
          emoji={emoji}
          count={reactionsCount[emoji] || 0}
          isActive={userReactions.has(emoji)}
          onToggle={handleToggleReaction}
          disabled={isLoading}
        />
      ))}
    </div>
  );
}
