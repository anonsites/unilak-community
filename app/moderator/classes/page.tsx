import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

export default async function ClassesSummaryPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const [finished, ongoing, surveys] = await Promise.all([
    supabase.from('classes_table').select('*', { count: 'exact', head: true }).lt('end_date', today),
    supabase.from('classes_table').select('*', { count: 'exact', head: true }).gte('end_date', today),
    supabase.from('survey_responses_table').select('*', { count: 'exact', head: true }),
  ]);

  const cards = [
    {
      title: 'Finished',
      count: finished.count || 0,
      href: '/moderator/classes/manage?status=finished',
      border: 'hover:border-rose-500/60',
      icon: 'bg-rose-500/10 text-rose-400',
      description: 'View completed classes',
    },
    {
      title: 'Ongoing',
      count: ongoing.count || 0,
      href: '/moderator/classes/manage?status=ongoing',
      border: 'hover:border-emerald-500/60',
      icon: 'bg-emerald-500/10 text-emerald-400',
      description: 'View active classes',
    },
    {
      title: 'Survey Responses',
      count: surveys.count || 0,
      href: '/moderator/survey',
      border: 'hover:border-amber-500/60',
      icon: 'bg-amber-500/10 text-amber-400',
      description: 'Review class feedback',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#535350] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between rounded-xl bg-gray-900 p-4 shadow-lg md:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">CLASSES</h1>
            <p className="mt-1 text-sm text-gray-400">Choose a class group or review survey responses.</p>
          </div>
          <Link href="/moderator" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white">
            BACK
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.title} href={card.href} className="group">
              <article className={`flex min-h-56 flex-col rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-lg transition-colors ${card.border}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-200 transition-colors group-hover:text-white">{card.title}</h2>
                  <span className={`rounded-lg px-3 py-2 ${card.icon}`} aria-hidden="true">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                    </svg>
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-5xl font-bold text-white">{card.count}</span>
                </div>
                <p className="text-sm text-gray-500 transition-colors group-hover:text-gray-300">{card.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
