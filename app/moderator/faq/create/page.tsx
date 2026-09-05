'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function CreateFAQPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    keywords: '' as string,
    order: 0,
    is_published: true,
  });

  const categories = ['General', 'Registration', 'Student life', 'Rules', 'Opportunities', 'Other'];

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      showToast('Question is required', 'error');
      return;
    }
    if (!formData.answer.trim()) {
      showToast('Answer is required', 'error');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Not authenticated', 'error');
        return;
      }

      // Parse keywords (comma-separated)
      const keywords = formData.keywords
        .split(',')
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0);

      // Insert FAQ
      const { error } = await supabase
        .from('faq_table')
        .insert([
          {
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            keywords: keywords.length > 0 ? keywords : null,
            order: formData.order,
            is_published: formData.is_published,
            created_by: user.id,
          },
        ]);

      if (error) throw error;

      showToast('FAQ created successfully!', 'success');
      setTimeout(() => router.push('/moderator/information'), 1500);
    } catch (error: any) {
      console.error('Error creating FAQ:', error);
      showToast(error.message || 'Failed to create FAQ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#535350] p-4 md:p-8 text-white">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wider">Create New FAQ</h1>
          <Link href="/moderator/information" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-gray-700">
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6 shadow-xl">
          {/* Question */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="Enter the FAQ question..."
              maxLength={500}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.question.length}/500 characters</p>
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              placeholder="Enter the detailed answer..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Provide a comprehensive answer to the question</p>
          </div>

          {/* Category and Order Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Keywords (optional)</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="Enter keywords separated by commas (e.g., registration, deadline, deadline)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple keywords with commas</p>
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleInputChange}
              className="w-5 h-5 bg-gray-800 border border-gray-700 rounded cursor-pointer accent-cyan-500"
            />
            <label className="text-sm font-medium text-gray-300 cursor-pointer">
              Publish immediately (make visible to users)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create FAQ
                </>
              )}
            </button>
            <Link
              href="/moderator/information"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-gray-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
