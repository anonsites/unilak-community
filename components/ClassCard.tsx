import Link from 'next/link';
import { UniversityClass } from '@/lib/types';

type ClassCardProps = {
  classItem: UniversityClass;
  compact?: boolean;
};

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function ClassCard({ classItem, compact = false }: ClassCardProps) {
  const isNew = classItem.created_at
    ? (new Date().getTime() - new Date(classItem.created_at).getTime()) < 24 * 60 * 60 * 1000
    : false;

  return (
    <Link
      href={`/find-classes/${classItem.id}`}
      className={`block relative rounded-lg border border-white/50 bg-gray-800 p-5 shadow-lg transition hover:border-cyan-500/50 hover:shadow-cyan-500/20 ${
        compact ? 'flex items-center gap-4' : ''
      }`}
    >
      {isNew && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          New
        </span>
      )}

      <div className={`${compact ? 'grow' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">
          {classItem.faculty} - {classItem.department}
        </p>
        <h3 className={`mt-1 font-extrabold text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
          {classItem.course_name}
        </h3>

        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">{classItem.program}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">Program</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">{classItem.intake}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">Intake</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">Year {classItem.year_of_study}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">Level</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">{classItem.lecturer || 'N/A'}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">Lecturer</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">{formatDate(classItem.start_date)}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">Starts</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="mt-1 font-semibold text-cyan-200">{formatDate(classItem.cat_date)}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-white">CAT</p>
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-5">
          <button className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-lg font-bold text-white transition hover:bg-cyan-500">
            View Details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </Link>
  );
}