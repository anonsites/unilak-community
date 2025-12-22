'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import RequestCard from './RequestCard';
import { Toaster } from 'react-hot-toast';
import NotificationListener from '@/components/NotificationListener';

type RequestWithRelations = Database['public']['Tables']['announcement_requests_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
  phone?: string | null;
  announcement_responses_table: { user_id: string | null; seen: boolean | null }[];
};

export default function AnnouncementRequestsPage() {
  const searchParams = useSearchParams();
  const filter = (searchParams.get('filter') as 'pending' | 'approved') || 'pending';
  const [requests, setRequests] = useState<RequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [supabase] = useState(() => createClient());
  const [refreshKey, setRefreshKey] = useState(0);
  const prevFilter = useRef(filter);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (prevFilter.current !== filter) {
        setLoading(true);
        prevFilter.current = filter;
      }

      const { data, error } = await supabase
        .from('announcement_requests_table')
        .select(`
          *,
          profiles_table (username, avatar_url),
          announcement_responses_table (user_id, seen)
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (!error && data) setRequests(data as RequestWithRelations[]);
      setLoading(false);
    };

    fetchRequests();
  }, [filter, supabase, refreshKey]);

  // Realtime subscription for new requests
  useEffect(() => {
    const channel = supabase
      .channel('moderator_requests_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_requests_table' },
        () => {
          handleRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, handleRefresh]);

  return (
    <div className="min-h-screen bg-[#535350] p-6 w-full">
      <Toaster position="top-right" />
      <NotificationListener />
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-lg md:text-2xl font-bold tracking-wider uppercase">
          Announcement Requests
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Filters */}
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <Link
              href="/moderator/announcements?filter=pending"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Requested
            </Link>
            <Link
              href="/moderator/announcements?filter=approved"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Approved
            </Link>
          </div>

          <Link
            href="/moderator" 
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors text-gray-300 hover:text-white flex-shrink-0"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
        ) : (
          requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onRefresh={handleRefresh} 
              showToast={showToast}
            />
          ))
        )}
        {!loading && requests.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No {filter} requests found.
          </div>
        )}
      </div>
    </div>
  );
}
