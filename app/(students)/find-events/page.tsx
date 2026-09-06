import AdvertToast from '@/components/others/AdvertToast';
import AdvertSection from '@/components/home/AdvertSection';
import EventFeed from './EventFeed';
import { createClient } from '@/lib/supabaseServer';

export default async function JoinEventsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: events, error } = await supabase
    .from('events_table')
    .select('id, title, category, flyer_url, interest_count, start_date, end_date, duration, venue, venue_value')
    .eq('status', 'published')
    .gte('end_date', now)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Public events query failed:', error);
  }

  const eventCards = (events || []).map((event) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    flyerUrl: event.flyer_url,
    interestCount: event.interest_count,
    startDate: event.start_date,
    endDate: event.end_date,
    duration: event.duration,
    venue: event.venue,
    venueValue: event.venue_value,
  }));

  return (
    <div className="min-h-screen bg-[#535350] text-white">
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wider text-white">JOIN EVENTS</h1>
      </header>

      <div className="max-w-5xl mx-auto p-5">
        {error ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="text-xl font-semibold">Events are temporarily unavailable</h2>
              <p className="mt-2 text-white/70">Please try again later.</p>
            </div>
          </div>
        ) : <EventFeed events={eventCards} />}

        <div className="mt-8">
          <AdvertSection />
        </div>
      </div>

      <AdvertToast />
    </div>
  );
}
