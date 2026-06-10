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
  return (
    <Link
      href={`/find-classes/${classItem.id}`}
      className={`block rounded-lg border border-white/50 bg-gray-800 p-5 shadow-lg transition hover:border-cyan-500/50 hover:shadow-cyan-500/20 ${
        compact ? 'flex items-center gap-4' : ''
      }`}
    >
      <div className={`${compact ? 'flex-grow' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">
          {classItem.faculty} - {classItem.department}
        </p>
        <h3 className={`mt-1 font-extrabold text-white ${compact ? 'text-lg' : 'text-2xl'}`}>
          {classItem.course_name}
        </h3>

        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white">Program</p>
              <p className="mt-1 font-semibold text-cyan-200">{classItem.program}</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white">Intake</p>
              <p className="mt-1 font-semibold text-cyan-200">{classItem.intake}</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white">Year of Study</p>
              <p className="mt-1 font-semibold text-cyan-200">Year {classItem.year_of_study}</p>
            </div>
            <div className="rounded-md border border-gray-700/50 bg-black/15 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white">Lecturer</p>
              <p className="mt-1 font-semibold text-cyan-200">{classItem.lecturer || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className={`mt-4 flex items-center gap-2 ${compact ? 'text-sm' : 'text-xs'}`}>
          <span className="rounded-full bg-gray-700 px-2 py-1 font-semibold text-cyan-200">
            {classItem.classroom || 'Ongoing'}
          </span>
          <span className="rounded-full bg-gray-700 px-2 py-1 font-semibold text-cyan-200">
            Starts: {formatDate(classItem.start_date)}
          </span>
          {classItem.cat_date && (
            <span className="rounded-full bg-gray-700 px-2 py-1 font-semibold text-cyan-200">
              CAT: {formatDate(classItem.cat_date)}
            </span>
          )}
        </div>
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