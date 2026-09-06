import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

export default async function ModeratorDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Moderator';

  // Fetch stats
  const [announcements, feedback, users, classes, events, faqs] = await Promise.all([
    supabase.from('announcements_table').select('*', { count: 'exact', head: true }),
    supabase.from('feedback_table').select('*', { count: 'exact', head: true }),
    supabase.from('profiles_table').select('*', { count: 'exact', head: true }),
    supabase.from('classes_table').select('*', { count: 'exact', head: true }).gte('end_date', today),
    supabase.from('events_table').select('*', { count: 'exact', head: true }),
    supabase.from('faq_table').select('*', { count: 'exact', head: true })
  ]);

  const stats = {
    totalAnnouncements: announcements.count || 0,
    totalFeedback: feedback.count || 0,
    totalUsers: users.count || 0,
    totalClasses: classes.count || 0,
    totalEvents: events.count || 0,
    totalFAQs: faqs.count || 0
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* Header */}
      <div className="w-full bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 py-8 shadow-xl mb-8 border-b border-gray-600">
        <div className="w-full px-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">COMMUNITY DASHBOARD</h1>
            <p className="text-white/80 text-lg mt-1">Welcome back {username} , here is what is happenning</p>
          </div>
          
        </div>
      </div>

      <div className="w-full px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Announcements Card */}
        <Link href="/moderator/announcements" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-yellow-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-yellow-400 transition-colors">Announcements</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalAnnouncements}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full uppercase">Published</span>
            </div>
          </div>
        </Link>

        {/* Events Card */}
        <Link href="/moderator/events" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-rose-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-rose-400 transition-colors">Events</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalEvents}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Published events</span>
            </div>
          </div>
        </Link>

        {/* Classes Management Card */}
        <Link href="/moderator/classes" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-emerald-400 transition-colors">Classes</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalClasses}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Ongoing classes</span>
            </div>
          </div>
        </Link>

        {/* Feedback Card */}
        <Link href="/moderator/feedback" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-purple-400 transition-colors">Feedback</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalFeedback}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Messages</span>
            </div>
          </div>
        </Link>

        {/* Total Users Card */}
        <Link href="/moderator/users" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-green-400 transition-colors">Users</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalUsers}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Community</span>
            </div>
          </div>
        </Link>

        {/* FAQ Card */}
        <Link href="/moderator/information" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-cyan-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">FAQs</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalFAQs}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Information</span>
            </div>
          </div>
        </Link>
      </div>
      </div>
    </div>
  )
}