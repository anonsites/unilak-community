import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import ReviewForm from '@/components/ReviewForm';
import RulesSection from '@/components/RulesSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a New Review',
  description: 'Share your experience by creating a new review. Help the UNILAK community grow with your feedback.',
};

export default async function CreateReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?next=/reviews/create');
  }

  return (
    <main className="min-h-screen bg-[#535350] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-black/20 p-6 rounded-lg">
          <h1 className="text-2xl font-bold tracking-wider">CREATE REVIEW</h1>
          <Link href="/reviews" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-md transition-colors">
            Cancel
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <ReviewForm />
          </div>
          <div className="hidden lg:block">
            <RulesSection />
          </div>
        </div>
      </div>
    </main>
  );
}