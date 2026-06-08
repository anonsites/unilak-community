import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import ReviewsGrid from '@/components/ReviewsGrid';
import TopicFilterSlider from '@/components/TopicFilterSlider';
import { Database } from '@/lib/database.types';
import { ReviewWithRelations } from '@/lib/types';
import FloatingAddButton from '@/components/FloatingAddButton';

// using shared `ReviewWithRelations` from `lib/types`

export const revalidate = 0;

/*
  generateMetadata and revalidate are only available in Server Components.
  Since this page now needs client-side interactivity for the modal,
  we've converted it to a Client Component.
*/
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  if (!topic) {
    return {
      title: 'Explore Reviews',
      description: 'Browse all reviews and discussions from the UNILAK community.',
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.from('topics_table').select('name').eq('id', topic).single();
  const topicName = data?.name || 'Topic';

  return {
    title: `${topicName} Reviews`,
    description: `Read honest reviews and discussions about ${topicName} at UNILAK.`,
  };
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { topic } = await searchParams;
  const selectedTopicId = topic;

  // Fetch Topics
  const { data: topics } = await supabase
    .from('topics_table')
    .select('id, name')
    .order('name');

  // Fetch Reviews
  let query = supabase
    .from('reviews_table')
    .select(`
      *,
      profiles_table (username, avatar_url),
      topics_table (name),
      subtopics_table (name)
    `)
    .order('created_at', { ascending: false })
    .range(0, 9);

  if (selectedTopicId) {
    query = query.eq('topic_id', selectedTopicId);
  }

  const { data: reviews } = await query;

  return (
    <main className="min-h-screen bg-[#535350] text-white font-sans pb-24">
      {/* MINIMIZED HEADER */}
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 px-4 md:px-8 flex items-center justify-center sticky top-0 z-40 backdrop-blur-md relative">
        <h1 className="text-xl font-bold tracking-wider text-white">STUDENTS STORIES</h1>
      </header>

      <div className="w-full space-y-4 p-4 md:p-8">
        
        {/* HEADER & FILTERS */}
        <section className="scale-95 origin-left">
          
          {/* Horizontal Scroll Topics */}
          <TopicFilterSlider topics={topics ?? []} selectedTopicId={selectedTopicId} />
        </section>

        {/* REVIEWS LIST */}
        <ReviewsGrid 
          key={selectedTopicId || 'all'}
          reviews={(reviews as ReviewWithRelations[]) ?? []} 
          topicId={selectedTopicId}
          currentUserId={user?.id}
        />

        {/* FLOATING ADD BUTTON */}
        <FloatingAddButton href={user ? "/reviews/create" : "/auth?next=/reviews/create"} />

      </div>

    </main>
  );
}