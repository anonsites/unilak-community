'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { updateReview } from '@/app/reviews/actions';
import Toast from './Toast';
import { Database } from '@/lib/database.types';

type Review = Database['public']['Tables']['reviews_table']['Row'];
type Topic = { id: string; name: string };
type Subtopic = { id: string; name: string; topic_id: string | null };

export default function EditReviewForm({ review }: { review: Review }) {
  const supabase = createClient();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  // Form State initialized with review data
  const [selectedTopic, setSelectedTopic] = useState<string>(review.topic_id || '');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(review.subtopic_id || '');
  const [reviewType, setReviewType] = useState<'positive' | 'negative'>(review.type as 'positive' | 'negative');
  const [content, setContent] = useState(review.content);
  const [recommendation, setRecommendation] = useState(review.recommendation || '');

  // Check if editable (24h window)
  const isEditable = review.created_at ? (new Date().getTime() - new Date(review.created_at).getTime()) / (1000 * 60 * 60) < 24 : false;

  // Load Topics
  useEffect(() => {
    const loadTopics = async () => {
      const { data } = await supabase.from('topics_table').select('*').order('name');
      if (data) setTopics(data);
    };
    loadTopics();
  }, [supabase]);

  // Load Subtopics
  useEffect(() => {
    if (selectedTopic) {
      const loadSubtopics = async () => {
        const { data } = await supabase
          .from('subtopics_table')
          .select('*')
          .eq('topic_id', selectedTopic)
          .order('name');
        if (data) setSubtopics(data);
      };
      loadSubtopics();
    }
  }, [selectedTopic, supabase]);

  const handleSubmit = async () => {
    if (!selectedTopic || !selectedSubtopic || !content) return;

    setSubmitting(true);
    try {
      await updateReview(review.id, {
        topic_id: selectedTopic,
        subtopic_id: selectedSubtopic,
        type: reviewType,
        content,
        recommendation,
      });
      
      setToast({ message: 'Review updated successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/reviews');
        router.refresh();
      }, 1500);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Error';
      setToast({ message: 'Failed to update: ' + errorMessage, type: 'error' });
    }
    setSubmitting(false);
  };

  if (!isEditable) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-gray-900/50 p-8 rounded-xl border border-gray-800 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">Edit Period Expired</h2>
        <p className="text-gray-400 mb-6">Reviews can only be edited within 24 hours of posting.</p>
        <button 
          onClick={() => router.push('/reviews')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-colors border border-gray-700"
        >
          Back to Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Topic Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Topic</label>
        <select 
          value={selectedTopic} 
          onChange={(e) => { setSelectedTopic(e.target.value); setSelectedSubtopic(''); }}
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
        >
          <option value="">Select Topic</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Subtopic Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Subtopic</label>
        <select 
          value={selectedSubtopic} 
          onChange={(e) => setSelectedSubtopic(e.target.value)}
          disabled={!selectedTopic}
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
        >
          <option value="">Select Subtopic</option>
          {subtopics.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
        </select>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Type</label>
        <div className="flex gap-4">
          <button onClick={() => setReviewType('positive')} className={`flex-1 py-3 rounded-lg border font-bold transition-all ${reviewType === 'positive' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-black border-gray-700 text-gray-500'}`}>POSITIVE 👍</button>
          <button onClick={() => setReviewType('negative')} className={`flex-1 py-3 rounded-lg border font-bold transition-all ${reviewType === 'negative' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-black border-gray-700 text-gray-500'}`}>NEGATIVE 👎</button>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Review Content</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* Recommendation */}
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Recommendation (Optional)</label>
        <input 
          type="text" 
          value={recommendation} 
          onChange={(e) => setRecommendation(e.target.value)} 
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => router.push('/reviews')} 
          disabled={submitting} 
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all border border-gray-700 disabled:opacity-50"
        >
          CANCEL
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50">
          {submitting ? 'UPDATING...' : 'UPDATE REVIEW'}
        </button>
      </div>
    </div>
  );
}