'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import { Toaster } from 'react-hot-toast';
import RequestCard from './RequestCard';

type Announcement = Database['public']['Tables']['announcements_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
};

export default function AnnouncementsPage() {
  const [supabase] = useState(() => createClient());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from('announcements_table')
      .select('*, profiles_table:user_id(username, avatar_url)')
      .order('created_at', { ascending: false });
    setAnnouncements((data || []) as Announcement[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnouncements();
  }, [fetchAnnouncements, refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel('announcements_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements_table' }, () => setRefreshKey((key) => key + 1))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="min-h-screen w-full bg-[#535350] p-6">
      <Toaster position="top-right" />
      <div className="mb-8 flex items-center justify-between rounded-xl bg-gray-900 p-4 text-white shadow-lg md:p-6">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-wider md:text-2xl">Announcements</h1>
          <p className="mt-1 text-sm text-gray-400">Published announcements can be edited or removed here.</p>
        </div>
        <Link href="/moderator" className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-300 hover:text-white" title="Close">CLOSE</Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <div className="col-span-full py-12 text-center text-gray-500">Loading...</div> : announcements.map((announcement) => (
          <RequestCard key={announcement.id} request={announcement} onRefresh={() => setRefreshKey((key) => key + 1)} />
        ))}
        {!loading && announcements.length === 0 && <div className="col-span-full py-12 text-center text-gray-500">No announcements found.</div>}
      </div>
    </div>
  );
}
