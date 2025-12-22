import { createClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import EditReviewForm from '@/components/EditReviewForm';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Edit Review`,
    // To prevent search engines from indexing edit pages
    robots: { index: false, follow: false },
  };
}

export default async function EditReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: review } = await supabase
    .from('reviews_table')
    .select('*')
    .eq('id', id)
    .single();

  if (!review) {
    return <div className="text-white text-center p-10">Review not found</div>;
  }

  if (review.user_id !== user.id) {
    return <div className="text-white text-center p-10">Unauthorized</div>;
  }

  return (
    <main className="min-h-screen bg-[#535350] text-white p-4 md:p-8 font-sans">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8 bg-black/20 p-6 rounded-lg">
          <h1 className="text-2xl font-bold tracking-wider">EDIT REVIEW</h1>
          <Link href="/reviews" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-md transition-colors">
            Cancel
          </Link>
        </div>
        <EditReviewForm review={review} />
      </div>
    </main>
  );
}