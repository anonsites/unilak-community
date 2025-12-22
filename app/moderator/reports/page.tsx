'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ConfirmModal from '@/components/ConfirmModal';
import { timeAgo } from '@/lib/utils';
import Avatar from '@/components/Avatar';

interface Report {
  id: string;
  reason: string;
  created_at: string;
  reviews_table: {
    id: string;
    content: string;
    profiles_table: {
      username: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

export default function ReportedReviewsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [actionId, setActionId] = useState<{ id: string; type: 'dismiss' | 'delete_review' } | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports_table')
        .select(`
          *,
          reviews_table (
            id,
            content,
            profiles_table (username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setReports(data as unknown as Report[]);
      }
      setLoading(false);
    };

    fetchReports();
  }, [supabase]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async () => {
    if (!actionId) return;

    if (actionId.type === 'dismiss') {
      // Delete the report only
      const { error } = await supabase
        .from('reports_table')
        .delete()
        .eq('id', actionId.id);

      if (error) {
        showToast('Failed to dismiss report', 'error');
      } else {
        showToast('Report dismissed', 'success');
        setReports((prev) => prev.filter((r) => r.id !== actionId.id));
      }
    } else if (actionId.type === 'delete_review') {
      // Delete the review (cascade should handle report, but we remove from UI)
      // We need the review ID, which we can find from the reports list or pass it differently.
      // For simplicity, let's assume actionId.id is the REPORT ID, and we find the review ID.
      const report = reports.find(r => r.id === actionId.id);
      if (report?.reviews_table?.id) {
        const { error } = await supabase
          .from('reviews_table')
          .delete()
          .eq('id', report.reviews_table.id);

        if (error) {
          showToast('Failed to delete review', 'error');
        } else {
          showToast('Review deleted', 'success');
          // Remove all reports associated with this review from UI
          setReports((prev) => prev.filter((r) => r.reviews_table?.id !== report.reviews_table?.id));
        }
      }
    }
    setActionId(null);
  };

  return (
    <div className="min-h-screen bg-[#535350] p-6 w-full">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {actionId && (
        <ConfirmModal
          title={actionId.type === 'dismiss' ? 'Dismiss Report?' : 'Delete Review?'}
          message={actionId.type === 'dismiss' 
            ? "This will remove the report. The review will remain visible to the public." 
            : "This will permanently delete the review and remove this report."}
          onConfirm={handleAction}
          onCancel={() => setActionId(null)}
          confirmText={actionId.type === 'dismiss' ? 'DISMISS' : 'DELETE REVIEW'}
          isDestructive={actionId.type === 'delete_review'}
        />
      )}

      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center gap-4">
        <h1 className="text-lg md:text-2xl font-bold tracking-wider uppercase">
          REPORTED REVIEWS
        </h1>
        
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reported reviews found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const username = report.reviews_table?.profiles_table?.username || 'Unknown';
            const avatarLetter = username.startsWith('anon_')
              ? (username.charAt(5) || username.charAt(0)).toUpperCase()
              : username.charAt(0).toUpperCase();
            return (
            <div key={report.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col gap-4 shadow-sm hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide bg-red-900/20 px-2 py-1 rounded">
                  Reason: {report.reason}
                </span>
                <span className="text-xs text-gray-500">{timeAgo(report.created_at)}</span>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <p className="text-gray-300 text-sm italic mb-2">&quot;{report.reviews_table?.content || 'Review content unavailable'}&quot;</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 shrink-0">
                    <Avatar 
                      url={report.reviews_table?.profiles_table?.avatar_url} 
                      alt={username}
                      fallback={<span className="text-xs font-bold text-gray-300">{avatarLetter}</span>}
                      imageClassName="w-full h-full object-cover"
                      emojiClassName="text-sm leading-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-bold">@{username}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-2">
                <button
                  onClick={() => setActionId({ id: report.id, type: 'dismiss' })}
                  className="flex-1 py-2 text-sm font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                >
                  DISMISS
                </button>
                <button
                  onClick={() => setActionId({ id: report.id, type: 'delete_review' })}
                  className="flex-1 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                >
                  DELETE REVIEW
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}