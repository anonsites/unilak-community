'use client';

import { useState } from 'react';
import ReviewCard from './ReviewCard';
import { ReviewWithRelations } from '@/lib/types';
import { createClient } from '@/lib/auth';

interface ReviewsGridProps {
  reviews: ReviewWithRelations[];
  topicId?: string;
  currentUserId?: string;
}

const PAGE_SIZE = 10;

export default function ReviewsGrid({ reviews: initialReviews, topicId, currentUserId }: ReviewsGridProps) {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>(initialReviews);
  const [offset, setOffset] = useState(initialReviews.length);
  const [hasMore, setHasMore] = useState(initialReviews.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const loadMore = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews_table')
        .select(`
          *,
          profiles_table (username, avatar_url),
          topics_table (name),
          subtopics_table (name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const newReviews = data as unknown as ReviewWithRelations[];
        setReviews((prev) => [...prev, ...newReviews]);
        setOffset((prev) => prev + newReviews.length);
        if (newReviews.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="h-full">
            <ReviewCard 
              review={review} 
              currentUserId={currentUserId} 
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}