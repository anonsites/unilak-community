'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';

type FAQRow = Database['public']['Tables']['faq_table']['Row'];

export default function FAQManagementPage() {
  const [supabase] = useState(() => createClient());
  const [faqs, setFaqs] = useState<FAQRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Categories as defined in schema_updates.sql
  const categories = ['All', 'General', 'Registration', 'Student life', 'Rules', 'Opportunities', 'Other'];

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq_table')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      console.error('Error fetching FAQs:', error);
      showToast('Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('faq_table')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, is_published: !currentStatus } : f));
      showToast(`FAQ ${!currentStatus ? 'published' : 'unpublished'} successfully`, 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faq_table')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFaqs(prev => prev.filter(f => f.id !== id));
      showToast('FAQ deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#535350] p-4 md:p-8 text-white">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider">Information Room Management</h1>
            <p className="text-gray-400 mt-1">Total published FAQs: {faqs.filter(f => f.is_published).length}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/moderator/information/create" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add New FAQ
            </Link>
            <Link href="/moderator" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-gray-700">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800 flex flex-col md:flex-row gap-4 shadow-xl">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Search Content</label>
            <input 
              type="text" 
              placeholder="Search by question or answer keywords..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Category Filter</label>
            <select 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading Information Room content...</div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400 italic">
              No matching questions found.
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-cyan-500/30 transition-all shadow-md group">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded uppercase tracking-widest border border-cyan-500/20">
                        {faq.category}
                      </span>
                      <span className="text-gray-500 text-xs">Pos: {faq.order}</span>
                      <span className="text-gray-500 text-xs">• {faq.view_count} views</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-cyan-400 transition-colors">{faq.question}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{faq.answer}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button 
                      onClick={() => handleTogglePublish(faq.id, faq.is_published ?? false)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        faq.is_published 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                      }`}
                    >
                      {faq.is_published ? 'Visible' : 'Hidden'}
                    </button>
                    
                    <Link 
                      href={`/moderator/information/${faq.id}/edit`}
                      className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                      title="Edit FAQ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>

                    <button 
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all"
                      title="Delete FAQ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                
                {faq.keywords && faq.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {faq.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700 font-medium">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
