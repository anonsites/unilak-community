'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import SubmissionModal from '@/components/students/announcements/SubmissionModal';

type Announcement = Database['public']['Tables']['announcements_table']['Row'] & {
  announcement_responses_table: { count: number }[];
};

export default function AnnouncementManagePage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('announcements_table').select('*, announcement_responses_table(count)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) toast.error('Unable to load your announcements');
    else setAnnouncements((data || []) as Announcement[]);
  }, [supabase, user]);

  useEffect(() => { supabase.auth.getUser().then(({ data: { user } }) => setUser(user)); }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async (message: string, phone: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('announcements_table').insert({ message, phone: phone || null, user_id: user.id });
    if (error) toast.error('Failed to publish announcement');
    else { toast.success('Announcement published'); setShowModal(false); fetchAnnouncements(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements_table').delete().eq('id', id).eq('user_id', user?.id || '');
    if (error) toast.error('Failed to delete announcement');
    else { toast.success('Announcement deleted'); fetchAnnouncements(); }
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white">
      <Toaster position="top-center" />
      <header className="sticky top-0 z-40 flex items-center justify-center border-b border-gray-800 bg-gray-900/80 px-4 py-4 backdrop-blur-md"><h1 className="text-xl font-bold tracking-wider">MY ANNOUNCEMENTS</h1></header>
      <main className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        {user ? announcements.length ? (
          <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2">
            {announcements.map((announcement) => <article key={announcement.id} className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
              <p className="whitespace-pre-wrap wrap-break-word text-lg leading-relaxed text-white/90">{announcement.message}</p>
              <div className="mt-5 flex items-center justify-between border-t border-gray-800 pt-4 text-xs text-gray-400"><span>{announcement.announcement_responses_table?.[0]?.count || 0} responses</span><span>{announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : ''}</span><button onClick={() => handleDelete(announcement.id)} className="font-bold text-red-400 hover:text-red-300">DELETE</button></div>
            </article>)}
          </div>
        ) : <div className="py-32 text-center"><h2 className="text-xl font-bold">No announcements yet</h2><p className="mt-2 text-white/70">Publish your first announcement and it will appear immediately.</p></div> : <div className="py-32 text-center"><p className="mb-4">Please join the community to create announcements.</p><Link href="/auth" className="rounded-lg bg-blue-600 px-5 py-3 font-bold">Join Community</Link></div>}
      </main>
      {user && <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 z-40 rounded-full bg-blue-600 px-6 py-4 font-bold shadow-2xl hover:bg-blue-500">+ CREATE</button>}
      <SubmissionModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
