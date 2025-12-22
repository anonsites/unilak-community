'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import ConfirmModal from '@/components/ConfirmModal';

interface Fact {
  id: number;
  message: string;
  created_at: string;
}

export default function CreateDidYouKnowPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 5;
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchFacts = async () => {
    const { count } = await supabase
      .from('did_you_know_table')
      .select('*', { count: 'exact', head: true });
    if (count !== null) setTotalCount(count);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('did_you_know_table')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (data) setFacts(data);
  };

  useEffect(() => {
    fetchFacts();
  }, [page]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    const { error } = await supabase
      .from('did_you_know_table')
      .delete()
      .eq('id', deleteId);

    if (error) {
      showToast('Failed to delete fact', 'error');
    } else {
      showToast('Fact deleted successfully', 'success');
      fetchFacts();
      router.refresh();
    }
    setDeleteId(null);
  };

  const handleUpdate = async (id: number) => {
    if (!editMessage.trim()) return;

    const { error } = await supabase
      .from('did_you_know_table')
      .update({ message: editMessage.trim() })
      .eq('id', id);

    if (error) {
      showToast('Failed to update fact', 'error');
    } else {
      showToast('Fact updated successfully', 'success');
      setEditingId(null);
      fetchFacts();
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('did_you_know_table')
        .insert([{ message: message.trim() }]);

      if (error) throw error;

      setMessage('');
      showToast('Fact published successfully!', 'success');
      if (page !== 1) {
        setPage(1);
      } else {
        fetchFacts();
      }
      router.refresh();
    } catch (error) {
      console.error('Error creating fact:', error);
      showToast('Failed to create fact', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans p-6 flex flex-col items-center justify-center gap-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Fact?"
          message="Are you sure you want to delete this fact? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          confirmText="DELETE"
          isDestructive={true}
        />
      )}

      <div className="w-full max-w-7xl bg-gray-900 p-6 rounded-xl shadow-lg flex justify-between items-center border border-gray-800">
        <h1 className="text-2xl font-bold tracking-wider">MANAGE FACTS</h1>
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

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: List of Facts */}
        <div className="w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold tracking-wider text-gray-200">
              EXISTING FACTS
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {facts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No facts found.
              </div>
            ) : (
              facts.map((fact) => (
                <div key={fact.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 group hover:border-gray-600 transition-colors flex justify-between items-start gap-4">
                  {editingId === fact.id ? (
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleUpdate(fact.id)} 
                          className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm leading-relaxed break-words">{fact.message}</p>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(fact.id);
                            setEditMessage(fact.message);
                          }}
                          className="text-blue-500 hover:text-blue-400 transition-colors p-1"
                          title="Edit Fact"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(fact.id)}
                          className="text-red-500 hover:text-red-400 transition-colors p-1"
                          title="Delete Fact"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center border-t border-gray-800 pt-4 text-sm">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {page} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page * PAGE_SIZE >= totalCount}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-wider">ADD NEW FACT</h1>
          <Link 
            href="/moderator" 
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            CANCEL
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Did You Know?
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Enter an interesting fact about UNILAK..."
              required
            />
            <p className="text-right text-xs text-gray-500 mt-2">
              {message.length} characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all ${
              loading || !message.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {loading ? 'PUBLISHING...' : 'PUBLISH FACT'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
