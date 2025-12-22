import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import ReviewsGrid from '@/components/ReviewsGrid';
import TopicFilterSlider from '@/components/TopicFilterSlider';
import { Database } from '@/lib/database.types';
import FloatingAddButton from '@/components/FloatingAddButton';

type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string | null } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
};

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
      profiles_table (username),
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
        <h1 className="text-xl font-bold tracking-wider text-white">UNILAK REVIEWS</h1>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors p-1 absolute right-4 md:right-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </Link>
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