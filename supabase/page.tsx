'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

const REPORT_REASONS = [
  "Misleading/false information",
  "Sharing Scam/Spam/fraud content",
  "Includes disrespect",
  "Includes discrimination",
  "Talking nonsense",
  "Exposing sensitive information",
  "Includes wrong/ AI generated facts",
  "Against community rules",
  "Not agree/useful/Helpful"
];

export default function ReportPage({ params }: { params: { reviewId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<{ content: string; profiles_table: { username: string | null } | null } | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Check Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setSession(session);

      // 2. Fetch Review Details (to show what is being reported)
      const { data, error } = await supabase
        .from('reviews_table')
        .select('content, profiles_table(username)')
        .eq('id', params.reviewId)
        .single();
      
      if (error || !data) {
        setError('Review not found or has been deleted.');
      } else {
        setReview(data);
      }
      setLoading(false);
    };
    init();
  }, [params.reviewId, router]);

  const handleSubmit = async () => {
    if (!session) {
      setError('You must be logged in to submit a report.');
      return;
    }

    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('reports_table')
        .insert({
          review_id: params.reviewId,
          user_id: session.user.id,
          reason: selectedReason
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => router.back(), 2000);
    } catch (err: unknown) {
      let errorMessage = 'Failed to submit report.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans flex items-center justify-center">
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-green-500 shadow-lg shadow-green-900/20 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-full">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-500">Report Submitted</h3>
            <p className="text-sm text-gray-400">Thank you for helping keep our community safe.</p>
          </div>
        </div>
      )}

      <div className="max-w-lg w-full space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider text-red-500">REPORT REVIEW</h1>
          <p className="text-gray-500 text-sm mt-2">Help us keep the community safe</p>
        </div>

        {review && (
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-sm text-gray-400 italic">
            &quot; {review.content.substring(0, 100)}{review.content.length > 100 ? '...' : ''} &quot;
            <br />
            <span className="text-xs not-italic text-gray-600 mt-1 block">- {review.profiles_table?.username}</span>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
          {REPORT_REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-transparent hover:border-gray-700">
              <input 
                type="radio" 
                name="reason" 
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-red-600 bg-black border-gray-600 focus:ring-red-500"
              />
              <span className="text-gray-300 text-sm">{reason}</span>
            </label>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.back()}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-lg transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-gray-400 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
          >
            {submitting ? 'SENDING...' : 'REPORT'}
          </button>
        </div>

      </div>
    </main>
  );
}