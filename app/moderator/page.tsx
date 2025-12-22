import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

export default async function ModeratorDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Moderator';

  // Fetch stats
  const [reviews, announcements, feedback, users, facts, reports] = await Promise.all([
    supabase.from('reviews_table').select('*', { count: 'exact', head: true }),
    supabase.from('announcement_requests_table').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('feedback_table').select('*', { count: 'exact', head: true }),
    supabase.from('profiles_table').select('*', { count: 'exact', head: true }),
    supabase.from('did_you_know_table').select('*', { count: 'exact', head: true }),
    supabase.from('reports_table').select('*', { count: 'exact', head: true })
  ]);

  const stats = {
    totalReviews: reviews.count || 0,
    pendingAnnouncements: announcements.count || 0,
    totalFeedback: feedback.count || 0,
    totalUsers: users.count || 0,
    totalFacts: facts.count || 0,
    pendingReports: reports.count || 0
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 py-8 shadow-xl mb-8 border-b border-gray-600">
        <div className="w-full px-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">COMMUNITY DASHBOARD</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back {username} , here is what is happenning</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Create Did You Know */}
            <Link href="/moderator/did-you-know/create" className="p-3 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all" title="Add Did You Know Fact">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </Link>

            {/* Home Icon */}
            <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reviews Card */}
        <Link href="/moderator/reviews" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-blue-400 transition-colors">Reviews</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalReviews}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
            </div>
          </div>
        </Link>

        {/* Pending Requests Card */}
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
              <h3 className="text-4xl font-bold text-white">{stats.pendingAnnouncements}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full uppercase">Action Needed</span>
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

        {/* Facts Card */}
        <Link href="/moderator/did-you-know/create" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">Facts</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalFacts}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Content</span>
            </div>
          </div>
        </Link>

        {/* Reports Card */}
        <Link href="/moderator/reports" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-orange-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 13V6a2 2 0 012-2h2l2 2h6a2 2 0 012 2v1m-4 8h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-orange-400 transition-colors">Reports</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.pendingReports}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full uppercase">Review</span>
            </div>
          </div>
        </Link>
      </div>
      </div>
    </div>
  )
}