'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { createReview } from '@/app/reviews/actions';
import Toast from './Toast';

type Topic = { id: string; name: string };
type Subtopic = { id: string; name: string; topic_id: string | null };

export default function ReviewForm() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  // Form Selection State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<'positive' | 'negative' | null>(null);
  const [content, setContent] = useState('');
  const [recommendation, setRecommendation] = useState('');

  // Load Topics on Mount
  useEffect(() => {
    const loadTopics = async () => {
      setLoading(true);
      const { data } = await supabase.from('topics_table').select('*').order('name');
      if (data) setTopics(data);
      setLoading(false);
    };
    loadTopics();
  }, [supabase]);

  // Load Subtopics when Topic changes
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

  const handleTopicSelect = (id: string) => {
    setSelectedTopic(id);
    setSelectedSubtopic(null);
    setSubtopics([]);
  };

  const handleSubmit = async () => {
    if (!selectedTopic || !selectedSubtopic || !reviewType || !content) return;

    setSubmitting(true);

    try {
      await createReview({
        topic_id: selectedTopic,
        subtopic_id: selectedSubtopic,
        type: reviewType,
        content,
        recommendation,
      });
      
      setToast({ message: 'Review submitted successfully!', type: 'success' });
      
      setTimeout(() => {
        router.push('/reviews');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message || 'Error';
      setToast({ message: 'Failed to submit: ' + errorMessage, type: 'error' });
    }
    setSubmitting(false);
  };

  // Validation Helpers
  const isStep1Valid = selectedTopic !== null && selectedSubtopic !== null;
  const isStep2Valid = reviewType !== null;
  const isStep3Valid = content.trim().length > 5;

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900/50 p-6 rounded-xl border border-gray-800">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
        <span className={step >= 1 ? 'text-blue-500' : ''}>1. Topic</span>
        <span className="text-gray-700">-----</span>
        <span className={step >= 2 ? 'text-blue-500' : ''}>2. Type</span>
        <span className="text-gray-700">-----</span>
        <span className={step >= 3 ? 'text-blue-500' : ''}>3. Details</span>
      </div>

      {/* STEP 1: TOPIC & SUBTOPIC */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">I&apos;m talking about:</h2>
            <div className="flex flex-wrap gap-2">
              {loading ? <p className="text-gray-500">Loading topics...</p> : topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicSelect(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    selectedTopic === t.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {selectedTopic && (
            <div>
              <h3 className="text-lg font-bold text-gray-400 mb-3">Specifically:</h3>
              <div className="flex flex-wrap gap-2">
                {subtopics.length === 0 ? <p className="text-gray-600 text-sm">No subtopics found.</p> : subtopics.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedSubtopic(st.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      selectedSubtopic === st.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              NEXT &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TYPE */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold text-white mb-4">My review is:</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setReviewType('positive')}
              className={`p-8 rounded-xl border-2 flex flex-col items-center justify-center gap-4 transition-all ${
                reviewType === 'positive'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                  : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'
              }`}
            >
              <span className="text-4xl">👍</span>
              <span className="font-bold tracking-widest">POSITIVE</span>
            </button>

            <button
              onClick={() => setReviewType('negative')}
              className={`p-8 rounded-xl border-2 flex flex-col items-center justify-center gap-4 transition-all ${
                reviewType === 'negative'
                  ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                  : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'
              }`}
            >
              <span className="text-4xl">👎</span>
              <span className="font-bold tracking-widest">NEGATIVE</span>
            </button>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 font-bold hover:text-white"
            >
              &larr; BACK
            </button>
            <button
              disabled={!isStep2Valid}
              onClick={() => setStep(3)}
              className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              NEXT &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTENT */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Review / Claim / Issue</h2>
            <p className="text-gray-500 text-sm mb-4">Be honest, respectful, and constructive.</p>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your review here..."
              className="w-full h-40 bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Recommendation (Optional)</h3>
            <input
              type="text"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="What should be done?"
              className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 font-bold hover:text-white"
            >
              &larr; BACK
            </button>
            <button
              disabled={!isStep3Valid || submitting}
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
            >
              {submitting ? 'POSTING...' : 'POST REVIEW'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}