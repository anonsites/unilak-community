'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ConfirmModal from '@/components/ConfirmModal';
import { timeAgo } from '@/lib/utils';

interface Feedback {
  id: string;
  role: string;
  names: string;
  email: string;
  feedback_type: string;
  message: string;
  created_at: string;
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback_table')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setFeedbackList(data || []);
      }
      setLoading(false);
    };

    fetchFeedback();
  }, [supabase]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('feedback_table')
      .delete()
      .eq('id', deleteId);

    if (error) {
      showToast('Failed to delete feedback', 'error');
    } else {
      showToast('Feedback deleted successfully', 'success');
      setFeedbackList((prev) => prev.filter((item) => item.id !== deleteId));
    }
    setDeleteId(null);
  };

  return (
    <div className="p-6 w-full">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Feedback?"
          message="Are you sure you want to delete this feedback? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          confirmText="DELETE"
          isDestructive={true}
        />
      )}

      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-wider uppercase">COMMUNITY FEEDBACK</h1>
          <p className="text-gray-400 text-sm mt-1">Below is what users are talking about this site</p>
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading feedback...</div>
      ) : feedbackList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No feedback found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbackList.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col gap-4 shadow-sm hover:border-purple-500/30 transition-all group relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                    {item.names.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200">{item.names}</h3>
                    <p className="text-xs text-gray-500">{item.role} • {item.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{timeAgo(item.created_at)}</span>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {item.feedback_type}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
              </div>

              <button
                onClick={() => setDeleteId(item.id)}
                className="absolute top-6 right-6 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}