'use server';

import { createClient } from '@/lib/supabaseServer';
import { Database } from '@/lib/database.types';

type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string | null } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
};

function formatText(text: string): string {
  if (!text) return text;
  return text.replace(/(?:^|[\.\n])\s*([a-z])/g, (match) => match.toUpperCase());
}

export async function fetchReviews(offset: number, limit: number, topicId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('reviews_table')
    .select(`
      *,
      profiles_table (username),
      topics_table (name),
      subtopics_table (name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data } = await query;
  
  return (data as unknown as ReviewWithRelations[]) || [];
}

export async function createReview(review: {
  topic_id: string;
  subtopic_id: string;
  type: 'positive' | 'negative';
  content: string;
  recommendation?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('reviews_table').insert({
    user_id: user.id,
    topic_id: review.topic_id,
    subtopic_id: review.subtopic_id,
    type: review.type,
    content: formatText(review.content),
    recommendation: review.recommendation ? formatText(review.recommendation) : undefined,
  });

  if (error) throw error;
}

export async function submitReport(reviewId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be signed in to report a review.');

  const { error } = await supabase.from('reports_table').insert({
    review_id: reviewId,
    user_id: user.id,
    reason: reason,
  });

  if (error) throw error;
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('reviews_table')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function updateReview(reviewId: string, review: {
  topic_id: string;
  subtopic_id: string;
  type: 'positive' | 'negative';
  content: string;
  recommendation?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check if review is within 24 hours
  const { data: existingReview } = await supabase
    .from('reviews_table')
    .select('created_at')
    .eq('id', reviewId)
    .single();

  if (existingReview) {
    const hoursDiff = (Date.now() - new Date(existingReview.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursDiff >= 24) throw new Error('Reviews can only be edited within 24 hours of posting.');
  }

  const { error } = await supabase
    .from('reviews_table')
    .update({
      topic_id: review.topic_id,
      subtopic_id: review.subtopic_id,
      type: review.type,
      content: formatText(review.content),
      recommendation: review.recommendation ? formatText(review.recommendation) : undefined,
    })
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) throw error;
}