'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import EventDetailsModal from '@/components/students/events/EventDetailsModal';

type EventCard = {
  id: string;
  title: string;
  category: string;
  flyerUrl: string;
  interestCount: number;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  venue: string | null;
  venueValue: string | null;
};

export default function EventFeed({ events }: { events: EventCard[] }) {
  const [eventState, setEventState] = useState(events);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const expressInterest = async (event: EventCard) => {
    if (pendingId) return;
    setPendingId(event.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth?redirect=/find-events');
      setPendingId(null);
      return;
    }

    const { error } = await supabase.from('event_interests_table').insert({
      event_id: event.id,
      user_id: user.id,
    });

    if (!error || error.code === '23505') {
      setEventState((current) => current.map((item) => (
        item.id === event.id && !error
          ? { ...item, interestCount: item.interestCount + 1 }
          : item
      )));
    }

    setPendingId(null);
  };

  if (eventState.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md text-center">
          <h3 className="mt-4 text-xl font-semibold">No events yet</h3>
          <p className="mt-2 text-white/70">Check back later for upcoming campus events.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {eventState.map((event) => (
        <article
          key={event.id}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedEvent(event)}
          onKeyDown={(keyboardEvent) => {
            if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
              keyboardEvent.preventDefault();
              setSelectedEvent(event);
            }
          }}
          className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl transition hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <div className="aspect-4/5 bg-gray-800">
            <Image src={event.flyerUrl} alt={event.title} width={800} height={1000} className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">{event.category}</p>
              <p className="mt-1 truncate text-lg font-bold text-white">
                {event.startDate
                  ? new Date(event.startDate).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : 'Date to be announced'}
              </p>
            </div>
            <button
              type="button"
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                void expressInterest(event);
              }}
              disabled={pendingId === event.id}
              className="shrink-0 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60"
            >
              Interested
              <span className="ml-1 text-emerald-100">{event.interestCount}</span>
            </button>
          </div>
        </article>
      ))}
    </div>
    {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}