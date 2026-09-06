'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import EventModal from '@/components/moderator/EventModal';

type EventRow = Database['public']['Tables']['events_table']['Row'];
type EventForm = { title: string; category: string; startDate: string; endDate: string; duration: string };
type Tab = 'upcoming' | 'finished';

export default function ModeratorEventsPage() {
  const [supabase] = useState(() => createClient());
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [modalEvent, setModalEvent] = useState<EventRow | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase.from('events_table').select('*').order('start_date', { ascending: true });
    if (error) notify('Unable to load events');
    else setEvents(data || []);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvents();
  }, [fetchEvents]);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => tab === 'finished'
      ? Boolean(event.end_date && new Date(event.end_date).getTime() < now)
      : !event.end_date || new Date(event.end_date).getTime() >= now
    );
  }, [events, now, tab]);

  const saveEvent = async (form: EventForm, flyer: File | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { notify('You must be signed in'); return; }

    let flyerUrl = modalEvent?.flyer_url || '';
    if (flyer) {
      const path = `${user.id}/${crypto.randomUUID()}-${flyer.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const upload = await supabase.storage.from('event-flyers').upload(path, flyer, { upsert: false });
      if (upload.error) { notify('Failed to upload flyer'); return; }
      flyerUrl = supabase.storage.from('event-flyers').getPublicUrl(path).data.publicUrl;
    }

    const values = {
      title: form.title,
      category: form.category,
      flyer_url: flyerUrl,
      start_date: new Date(form.startDate).toISOString(),
      end_date: new Date(form.endDate).toISOString(),
      duration: form.duration,
      status: 'published' as const,
      created_by: modalEvent?.created_by || user.id,
      published_at: modalEvent?.published_at || new Date().toISOString(),
    };
    const result = modalEvent
      ? await supabase.from('events_table').update(values).eq('id', modalEvent.id)
      : await supabase.from('events_table').insert(values);

    if (result.error) notify('Failed to save event');
    else { setModalEvent(undefined); notify(modalEvent ? 'Event updated' : 'Event published'); await fetchEvents(); }
  };

  const deleteEvent = async (event: EventRow) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    const { error } = await supabase.from('events_table').delete().eq('id', event.id);
    if (error) notify('Failed to delete event');
    else { notify('Event deleted'); await fetchEvents(); }
  };

  return (
    <div className="min-h-screen bg-[#535350] p-6 text-white">
      {toast && <div className="fixed right-6 top-6 z-[60] rounded-lg bg-gray-900 px-5 py-3 font-semibold shadow-xl">{toast}</div>}
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-xl bg-gray-900 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div><h1 className="text-2xl font-bold tracking-wider">EVENTS</h1><p className="mt-1 text-sm text-gray-400">Manage upcoming and finished campus events.</p></div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <nav className="flex gap-1 rounded-lg border border-gray-700 bg-gray-800 p-1" aria-label="Event status">
              {(['upcoming', 'finished'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-3 py-2 text-sm font-bold capitalize ${tab === item ? 'bg-rose-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>{item}</button>)}
            </nav>
            <button onClick={() => setModalEvent(null)} className="rounded-lg bg-rose-600 px-4 py-2 font-bold hover:bg-rose-500">+ New event</button>
            <Link href="/moderator" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:text-white">BACK</Link>
          </div>
        </header>

        {visibleEvents.length === 0 ? <div className="rounded-xl border border-gray-700 bg-gray-900 p-16 text-center text-gray-400">No {tab} events.</div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleEvents.map((event) => <article key={event.id} className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">
            <div className="aspect-4/5 bg-gray-800"><Image src={event.flyer_url} alt={event.title} width={800} height={1000} className="h-full w-full object-cover" unoptimized /></div>
            <div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-400">{event.category}</p><h2 className="mt-1 truncate text-lg font-bold" title={event.title}>{event.title}</h2><p className="mt-2 text-xs text-gray-400">{event.start_date ? new Date(event.start_date).toLocaleString() : 'No start date'}{event.duration ? ` · ${event.duration}` : ''}</p><div className="mt-4 flex gap-2"><button onClick={() => setModalEvent(event)} className="flex-1 rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-bold text-blue-300 hover:bg-blue-600/40">Edit</button><button onClick={() => deleteEvent(event)} className="flex-1 rounded-lg bg-red-600/20 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-600/40">Delete</button></div></div>
          </article>)}
        </div>}
      </div>
      {modalEvent !== undefined && <EventModal event={modalEvent} onClose={() => setModalEvent(undefined)} onSave={saveEvent} />}
    </div>
  );
}
