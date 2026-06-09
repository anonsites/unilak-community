import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServer';
import { unwrap } from '@/lib/utils';
import AnnouncementSection from '@/components/AnnouncementSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import { Toaster } from 'react-hot-toast';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Announcements',
  description: 'Browse public UNILAK community announcements and reply to posts from students.',
};

export default async function AnnouncementsFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles_table')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    profile = data;
  }

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
    .order('created_at', { ascending: false });

  const processedAnnouncements = announcements?.map((ann) => {
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
    <div className="flex min-h-screen w-full flex-col bg-[#1d231d] text-white">
      <main className="w-full grow">
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 px-4 md:px-8 flex items-center justify-center sticky top-0 z-40 backdrop-blur-md relative">
        <h1 className="text-xl font-bold tracking-wider text-white">ANNOUNCEMENTS</h1>
      </header>

        <section className="border-b border-white/10 bg-[#1d231d] px-4 py-8 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <Link
              href="/announcements/manage"
              className="inline-flex w-fit items-center rounded-lg bg-blue-400 px-4 py-2 text-lg font-bold text-white transition hover:bg-blue-300"
            >
              MAKE ANNOUNCEMENT
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
          {processedAnnouncements.length > 0 ? (
            <AnnouncementSection
              announcements={processedAnnouncements}
              currentUserId={user?.id}
              currentUserProfile={profile}
              variant="feed"
            />
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 px-6 py-12 text-center">
              <h2 className="text-xl font-bold">No announcements yet</h2>
              <p className="mt-2 text-2xl text-white">
                Ask, report or announce something with the UNILAK community.
              </p>
              <Link
                href="/announcements/manage"
                className="mt-5 inline-flex rounded-lg bg-blue-400 px-4 py-2 text-lg font-bold text-white transition hover:bg-blue-300"
              >
                MAKE ANNOUNCEMENT
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <CookieConsent />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}
