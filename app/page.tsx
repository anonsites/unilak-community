import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import Footer from '@/components/Footer';
import DirectionSection from '../components/DirectionSection';
import DidYouKnowSlider from '@/components/DidYouKnowSlider';
import ReviewCard from '@/components/ReviewCard';
import CookieConsent from '@/components/CookieConsent';
import { unwrap } from '@/lib/utils';
import AnnouncementSection from '@/components/AnnouncementSection';
import Avatar from '@/components/Avatar';
import { ReviewWithRelations } from '@/lib/types';

// Revalidate the page every 60 seconds. This helps with performance while keeping data fresh.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'UNILAK Community - Reviews, Announcements & News',
  description: 'Join the UNILAK Community to share reviews, stay updated with announcements, and connect with students and staff.',
  openGraph: {
    title: 'UNILAK Community',
    description: 'Share reviews, get announcements, and connect with the UNILAK community.',
    type: 'website',
  },
  verification: {
    google: 'tFuQT-Ap5kGK3SrOlT1LcMzO1_4q4QcJe-2Pvt1OeR4',
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles_table')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // 1. Fetch Stats
  const [positiveRes, negativeRes] = await Promise.all([
    supabase.from('reviews_table').select('*', { count: 'exact', head: true }).eq('type', 'positive'),
    supabase.from('reviews_table').select('*', { count: 'exact', head: true }).eq('type', 'negative')
  ]);

  const positiveCount = positiveRes.count || 0;
  const negativeCount = negativeRes.count || 0;
  const totalReviews = positiveCount + negativeCount;

  // Calculate percentages for sliders
  const positiveWidth = totalReviews > 0 ? (positiveCount / totalReviews) * 100 : 0;
  const negativeWidth = totalReviews > 0 ? (negativeCount / totalReviews) * 100 : 0;

  // 2. Fetch Announcement
  const { data: announcements } = await supabase
    .from('announcements_table')
    .select(`
      id, 
      message,
      phone,
      created_at,
      announcement_requests_table (
        user_id,
        profiles_table (
          username,
          avatar_url
        )
      ),
      announcement_responses_table (count)
    `)
    .order('created_at', { ascending: false })

  const processedAnnouncements = announcements?.map(ann => {
    const requestData = unwrap(ann.announcement_requests_table);
    const profileData = unwrap(requestData?.profiles_table);
    const responseCount = unwrap(ann.announcement_responses_table)?.count || 0;
    return {
      id: ann.id,
      message: ann.message,
      phone: ann.phone,
      created_at: ann.created_at,
      username: profileData?.username,
      avatarUrl: profileData?.avatar_url,
      ownerId: requestData?.user_id ?? null,
      responseCount,
    };
  }) || [];

  // 3. Fetch Recent Reviews
  const { data: recentReviews } = await supabase
    .from('reviews_table')
    .select(`
      *,
      profiles_table (username, avatar_url),
      topics_table (name),
      subtopics_table (name)
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  // 4. Fetch Did You Know
  const { data: didYouKnows } = await supabase
    .from('did_you_know_table')
    .select('message')
    .order('created_at', { ascending: false })
    .limit(5);
  
  const facts = didYouKnows?.map(d => d.message) || [];

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans w-full flex flex-col">
      <header className="w-full bg-gradient-to-r from-gray-600 via-blue-500 to-gray-400 py-12 shadow-xl border-b-4 border-gray-800">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            UNILAK COMMUNITY
          </h1>
        </div>
      </header>
      <div className="w-full flex-grow">
        
        <div className="w-full bg-gray-900 py-8 px-4 md:px-8 shadow-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* TOP LEFT: STATS */}
            <div className="space-y-8">
              {/* POSITIVE STATS */}
              <Link href="/reviews">
                <div className="cursor-pointer hover:opacity-90 transition-opacity">
                  <h2 className="text-2xl font-bold mb-1 tracking-wider">
                    OVER <span className="text-blue-500">{positiveCount}+</span> Positive reviews
                  </h2>
                  <div className="w-full bg-gray-800 rounded-full h-12 border-2 border-white/20 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${positiveWidth}%` }}></div>
                  </div>
                </div>
              </Link>

              {/* NEGATIVE STATS */}
              <Link href="/reviews">
                <div className="cursor-pointer hover:opacity-90 transition-opacity">
                  <h2 className="text-2xl font-bold mb-1 tracking-wider">
                    AND <span className="text-orange-500">{negativeCount}+</span> Negative reviews
                  </h2>
                  <div className="w-full bg-gray-800 rounded-full h-12 border-2 border-white/20 overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${negativeWidth}%` }}></div>
                  </div>
                </div>
              </Link>
            </div>

            {/* TOP RIGHT: ANNOUNCEMENT */}
            <AnnouncementSection 
              announcements={processedAnnouncements.slice(0, 3)}
              currentUserId={user?.id}
              currentUserProfile={profile}
            />

            {/* BOTTOM LEFT: DIRECTION */}
            <div className="flex justify-center lg:justify-start">
              <DirectionSection />
            </div>

            {/* BOTTOM RIGHT: JOIN COMMUNITY */}
            <div className="flex justify-center lg:justify-end">
              <Link 
                href={user ? "/account" : "/auth"} 
                className="group bg-blue-600 hover:bg-blue-700 text-white font-bold p-1.5 rounded-full transition-all shadow-lg flex items-center"
              >
                <div className="bg-white/20 p-1 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden shrink-0">
                  <Avatar
                    url={profile?.avatar_url}
                    alt={profile?.username || 'User'}
                    imageClassName="w-full h-full object-cover rounded-full"
                    emojiClassName="text-2xl leading-none"
                    fallback={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                </div>
                <span className={`overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap ${
                  user 
                    ? "max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:px-3" 
                    : "max-w-xs opacity-100 px-3"
                }`}>
                  {user && profile?.username ? profile.username : "Join Community"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full space-y-12 p-4 md:p-8">
          {/* DID YOU KNOW */}
          {facts.length > 0 && <DidYouKnowSlider facts={facts} />}

          {/* RECENT REVIEWS */}
          <section>
            <h2 className="text-white text-left text-blue-500 font-bold mb-6 uppercase text-sm tracking-widest underline underline-offset-4">RECENT REVIEWS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(recentReviews as ReviewWithRelations[] | null)?.map((review) => (
                <div key={review.id} className="block h-full">
                  <ReviewCard review={review} currentUserId={user?.id} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-left">
              <Link href="/reviews" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                VIEW ALL REVIEWS
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </section>

          {/* ANNOUNCEMENT FEED */}
          <section>
            <h2 className="text-white text-left text-blue-500 font-bold mb-6 uppercase text-sm tracking-widest underline underline-offset-4">ANNOUNCEMENT FEED</h2>
            <AnnouncementSection 
              announcements={processedAnnouncements}
              currentUserId={user?.id}
              currentUserProfile={profile}
              variant="feed"
            />
            <div className="mt-8 text-left">
              <Link href="/announcement" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                View Your Announcements
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </section>

        </div>

      </div>
      {/* FOOTER */}
      <Footer />
      <CookieConsent />
    </div>
  );
}
