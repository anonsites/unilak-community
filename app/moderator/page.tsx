import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';

export default async function ModeratorDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Moderator';

  // Fetch stats
  const [reviews, announcements, feedback, users, facts, reports, classes, surveys, faqs] = await Promise.all([
    supabase.from('reviews_table').select('*', { count: 'exact', head: true }),
    supabase.from('announcement_requests_table').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('feedback_table').select('*', { count: 'exact', head: true }),
    supabase.from('profiles_table').select('*', { count: 'exact', head: true }),
    supabase.from('did_you_know_table').select('*', { count: 'exact', head: true }),
    supabase.from('reports_table').select('*', { count: 'exact', head: true }),
    supabase.from('classes_table').select('*', { count: 'exact', head: true }),
    supabase.from('survey_responses_table').select('*', { count: 'exact', head: true }),
    supabase.from('faq_table').select('*', { count: 'exact', head: true })
  ]);

  const stats = {
    totalStories: reviews.count || 0,
    pendingAnnouncements: announcements.count || 0,
    totalFeedback: feedback.count || 0,
    totalUsers: users.count || 0,
    totalFacts: facts.count || 0,
    pendingReports: reports.count || 0,
    totalClasses: classes.count || 0,
    totalSurveys: surveys.count || 0,
    totalFAQs: faqs.count || 0
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 py-8 shadow-xl mb-8 border-b border-gray-600">
        <div className="w-full px-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">COMMUNITY DASHBOARD</h1>
            <p className="text-white/80 text-lg mt-1">Welcome back {username} , here is what is happenning</p>
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
        {/* Student Stories Card */}
        <Link href="/moderator/reviews" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-blue-400 transition-colors">Students Stories</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalStories}</h3>
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

        {/* Survey Responses Card */}
        <Link href="/moderator/survey" className="block group">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-rose-500/50 transition-all h-48 flex flex-col relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 group-hover:text-rose-400 transition-colors">Survey Responses</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-4xl font-bold text-white">{stats.totalSurveys}</h3>
            </div>
            <div className="absolute bottom-4 right-6">
              <span className="text-xs font-semibold text-gray-500 uppercase">Contributions</span>
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