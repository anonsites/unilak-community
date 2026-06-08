import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import { unwrap } from '@/lib/utils';
import AnnouncementSection from '@/components/AnnouncementSection';
import Avatar from '@/components/Avatar';
import FindClassesWithSurvey from '@/components/FindClassesWithSurvey';
import StudentStoriesCard from '@/components/StudentStoriesCard';
import MakeAnnouncementCard from '@/components/AnnouncementCard';
import LearnMoreCard from '@/components/FaqCard';

// Revalidate the page every 60 seconds. This helps with performance while keeping data fresh.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'UNILAK Community',
  description: 'Find UNILAK classes, read student stories, follow announcements, and get community information in one place.',
  openGraph: {
    title: 'UNILAK Community',
    description: 'Find classes, share student stories, get announcements, and connect with the UNILAK community.',
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

  // 1. Fetch announcements for the top slider.
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



  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans w-full flex flex-col">
      <div className="w-full grow">
        <section className="w-full border-b border-white/10 bg-[#1d231d] px-4 py-8 shadow-lg md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <AnnouncementSection
              announcements={processedAnnouncements.slice(0, 3)}
              currentUserId={user?.id}
              currentUserProfile={profile}
            />

            <div className="flex justify-start lg:justify-end">
              <Link
                href={user ? "/account" : "/auth"}
                className="group inline-flex items-center rounded-full bg-blue-600 p-1.5 font-bold text-white shadow-lg transition hover:bg-blue-500"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 p-1">
                  <Avatar
                    url={profile?.avatar_url}
                    alt={profile?.username || 'User'}
                    imageClassName="w-full h-full object-cover rounded-full"
                    emojiClassName="text-2xl leading-none"
                    fallback={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.75 20.1a8.25 8.25 0 0 1 16.5 0 .75.75 0 0 1-.44.7 18.68 18.68 0 0 1-15.62 0 .75.75 0 0 1-.44-.7Z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                </div>
                <span className="px-3 text-lg">
                  {user && profile?.username ? profile.username : "Join Community"}
                </span>
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 md:px-8 md:py-12">
          <section>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <FindClassesWithSurvey />
              <StudentStoriesCard />
              <MakeAnnouncementCard />
              <LearnMoreCard />
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
