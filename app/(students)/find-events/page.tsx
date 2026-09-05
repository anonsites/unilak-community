import AdvertToast from '@/components/others/AdvertToast';
import AdvertSection from '@/components/home/AdvertSection';
import EventFeed from './EventFeed';
import { createClient } from '@/lib/supabaseServer';

export default async function JoinEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events_table')
    .select('id, title, category, flyer_url, interest_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const eventCards = (events || []).map((event) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    flyerUrl: event.flyer_url,
    interestCount: event.interest_count,
  }));

  return (
    <div className="min-h-screen bg-[#535350] text-white">
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wider text-white">JOIN EVENTS</h1>
      </header>

      <div className="max-w-5xl mx-auto p-5">
        <EventFeed events={eventCards} />

        <div className="mt-8">
          <AdvertSection />
        </div>
      </div>

      <AdvertToast />
    </div>
  );
}
