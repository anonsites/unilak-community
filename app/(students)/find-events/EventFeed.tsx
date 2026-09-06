'use client';

import { useState } from 'react';
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
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const supabase = createClient();
  const categories = Array.from(new Set(eventState.map((event) => event.category))).sort();
  const visibleEvents = selectedCategory
    ? eventState.filter((event) => event.category === selectedCategory)
    : eventState;

  const expressInterest = async (event: EventCard) => {
    if (pendingId) return;
    setPendingId(event.id);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('event_interests_table').insert({
      event_id: event.id,
      user_id: user?.id || null,
    });

    if (!error || error.code === '23505') {
      const updatedEvent = {
        ...event,
        interestCount: error ? event.interestCount : event.interestCount + 1,
      };
      setEventState((current) => current.map((item) => item.id === event.id ? updatedEvent : item));
      setInterestedIds((current) => new Set(current).add(event.id));
      setSelectedEvent(updatedEvent);
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
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        type="button"
        onClick={() => setSelectedCategory('')}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategory === ''
            ? 'border-cyan-400 bg-cyan-500 text-white'
            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-cyan-500'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setSelectedCategory(category)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'border-cyan-400 bg-cyan-500 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-cyan-500'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
    {visibleEvents.length === 0 ? (
      <div className="rounded-xl border border-white/10 bg-gray-900 px-6 py-16 text-center text-white/70">
        No events found in this category.
      </div>
    ) : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visibleEvents.map((event) => (
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
              disabled={pendingId === event.id || interestedIds.has(event.id)}
              className="shrink-0 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-default disabled:opacity-100"
            >
              {interestedIds.has(event.id) ? (
                <span aria-label="Interest recorded" className="text-xl leading-none">✓</span>
              ) : 'Interested'}
            </button>
          </div>
        </article>
      ))}
    </div>}
    {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}