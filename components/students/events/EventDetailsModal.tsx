'use client';

type EventDetails = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  venue: string | null;
  venueValue: string | null;
  interestCount: number;
};

interface EventDetailsModalProps {
  event: EventDetails;
  onClose: () => void;
}

const formatDate = (value: string | null) => value
  ? new Date(value).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    })
  : 'Not specified';

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const isOnline = event.venue === 'online';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="event-details-title">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/60 bg-gray-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="event-details-title" className="text-2xl font-bold text-white">{event.title}</h2>
        </div>
        <dl className="mt-6 space-y-4 text-sm">
          <div><dt className="text-white/80">Start</dt><dd className="mt-1 text-cyan-400">{formatDate(event.startDate)}</dd></div>
          <div><dt className="text-white/80">End</dt><dd className="mt-1 text-cyan-400">{formatDate(event.endDate)}</dd></div>
          <div><dt className="text-white/80">Duration</dt><dd className="mt-1 text-cyan-400">{event.duration || 'Not specified'}</dd></div>
          <div><dt className="text-white/80">Interested</dt><dd className="mt-1 text-cyan-400">{event.interestCount}</dd></div>
          <div><dt className="text-white/80">Venue</dt><dd className="mt-1 text-cyan-400">{isOnline ? 'Online' : 'On-site'}</dd></div>
          <div><dt className="text-white/80">{isOnline ? 'Event link' : 'Place'}</dt><dd className="mt-1 break-all text-cyan-400">{isOnline && event.venueValue ? <a href={event.venueValue} target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">{event.venueValue}</a> : event.venueValue || 'Not specified'}</dd></div>
        </dl>
        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">Close</button></div>
      </div>
    </div>
  );
}