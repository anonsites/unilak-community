'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Database } from '@/lib/database.types';

type EventRow = Database['public']['Tables']['events_table']['Row'];

type EventForm = {
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  duration: string;
};

interface EventModalProps {
  event?: EventRow | null;
  onClose: () => void;
  onSave: (form: EventForm, flyer: File | null) => Promise<void>;
}

const categories = ['Academic', 'prayer', 'Sports', 'Clubs', 'Social', 'Career', 'Other'];

export default function EventModal({ event, onClose, onSave }: EventModalProps) {
  const [form, setForm] = useState<EventForm>({
    title: event?.title || '',
    category: event?.category || 'Academic',
    startDate: event?.start_date ? event.start_date.slice(0, 16) : '',
    endDate: event?.end_date ? event.end_date.slice(0, 16) : '',
    duration: event?.duration || '',
  });
  const [flyer, setFlyer] = useState<File | null>(null);
  const [preview, setPreview] = useState(event?.flyer_url || '');
  const [saving, setSaving] = useState(false);

  const update = (key: keyof EventForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (eventSubmit: React.FormEvent) => {
    eventSubmit.preventDefault();
    setSaving(true);
    await onSave(form, flyer);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">{event ? 'Edit event' : 'New event'}</h2>
            <p className="text-sm text-gray-400">Add the flyer and event details.</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400 hover:text-white" aria-label="Close">&times;</button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <label className="flex aspect-4/5 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 text-center hover:border-rose-400">
              {preview ? <Image src={preview} alt="Event flyer preview" width={800} height={1000} className="h-full w-full object-cover" unoptimized /> : <span className="px-6 text-gray-400">Choose an event flyer</span>}
              <input type="file" accept="image/*" className="sr-only" onChange={(input) => {
                const selectedFile = input.target.files?.[0] || null;
                setFlyer(selectedFile);
                if (selectedFile) setPreview(URL.createObjectURL(selectedFile));
              }} />
            </label>
            <p className="mt-2 text-xs text-gray-500">PNG, JPG, or WEBP. The flyer is shown to students.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="event-title" className="mb-1 block text-sm font-medium text-gray-300">Title</label>
              <input id="event-title" required maxLength={180} value={form.title} onChange={(input) => update('title', input.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-rose-400" />
            </div>
            <div>
              <label htmlFor="event-category" className="mb-1 block text-sm font-medium text-gray-300">Category</label>
              <select id="event-category" value={form.category} onChange={(input) => update('category', input.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-rose-400">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="event-start" className="mb-1 block text-sm font-medium text-gray-300">Start date</label>
                <input id="event-start" required type="datetime-local" value={form.startDate} onChange={(input) => update('startDate', input.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-rose-400" />
              </div>
              <div>
                <label htmlFor="event-end" className="mb-1 block text-sm font-medium text-gray-300">End date</label>
                <input id="event-end" required type="datetime-local" value={form.endDate} onChange={(input) => update('endDate', input.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-rose-400" />
              </div>
            </div>
            <div>
              <label htmlFor="event-duration" className="mb-1 block text-sm font-medium text-gray-300">Duration</label>
              <input id="event-duration" required placeholder="e.g. 2 hours" value={form.duration} onChange={(input) => update('duration', input.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-rose-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
          <button type="submit" disabled={saving || (!event && !flyer)} className="rounded-lg bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving...' : event ? 'Save changes' : 'Publish event'}</button>
        </div>
      </form>
    </div>
  );
}
