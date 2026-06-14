'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import { timeAgo } from '@/lib/utils';

type SurveyResponse = Database['public']['Tables']['survey_responses_table']['Row'] & {
  classes_table: {
    whatsapp_link: string | null;
    cp_contact: string | null; // Add cp_contact to classes_table type for comparison
  } | null;
};

export default function SurveyManagementPage() {
  const [supabase] = useState(() => createClient());
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      // We join with classes_table to get the whatsapp_link for verification
      const { data, error } = await supabase
        .from('survey_responses_table')
        .select(`
          *,
          classes_table (
            whatsapp_link
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data as any);
    } catch (error: any) {
      console.error('Error fetching survey responses:', error);
      showToast('Failed to load survey data', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return;

    try {
      const { error } = await supabase
        .from('survey_responses_table')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setResponses(prev => prev.filter(r => r.id !== id));
      showToast('Response deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete response', 'error');
    }
  };

  const handleConfirm = async (response: SurveyResponse) => {
    if (!response.course_id) {
      showToast('No linked course found for this response', 'error');
      return;
    }

    // Check if the course_id is null (manually entered course)
    if (!response.course_id) {
      showToast('Cannot confirm contact for manually entered courses. Please add the course to the classes table first.', 'error');
      return;
    }

    if (!confirm(`Update official CP contact for "${response.course_name}" (ID: ${response.course_id}) to ${response.cp_contact}?`)) return;

    try {
      const { error: updateError } = await supabase
        .from('classes_table')
        .update({ cp_contact: response.cp_contact })
        .eq('id', response.course_id);

      if (updateError) throw updateError;
      showToast('Class contact updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update class contact', 'error');
    }
  };

  const filteredResponses = responses.filter(r => 
    r.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cp_contact.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#535350] p-4 md:p-8 text-white">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider">Survey Contributions</h1>
            <p className="text-gray-400 mt-1">Check student-submitted class info and verify details.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search course or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <Link href="/moderator" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-gray-700">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
          {loading ? (
            <div className="p-20 text-center text-gray-400">Loading responses...</div>
          ) : filteredResponses.length === 0 ? (
            <div className="p-20 text-center text-gray-400 italic">No survey responses yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Course & Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">CP Contact</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">WA Link</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Academic Info</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredResponses.map((resp) => (
                    <tr key={resp.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-400">{resp.course_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted {resp.created_at ? timeAgo(resp.created_at) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`tel:${resp.cp_contact}`} className="text-sm font-medium text-emerald-400 hover:underline">
                          {resp.cp_contact}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {resp.classes_table?.whatsapp_link ? (
                          <a href={resp.classes_table.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline truncate max-w-[200px] block" title={resp.classes_table.whatsapp_link}>
                            {resp.classes_table.whatsapp_link}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600 italic">No link available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {resp.department} • {resp.intake} • {resp.program}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleConfirm(resp)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Confirm & Update Contact">
                            {/* Disable button if course_id is null or if cp_contact is already the same */}
                            <button
                              onClick={() => handleConfirm(resp)}
                              className={`p-2 rounded-lg border transition-all ${resp.course_id && resp.cp_contact !== resp.classes_table?.cp_contact ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed'}`}
                              title={resp.course_id ? (resp.cp_contact === resp.classes_table?.cp_contact ? 'Contact already up-to-date' : 'Confirm & Update Contact') : 'Cannot confirm contact for manually entered courses'}
                              disabled={!resp.course_id || resp.cp_contact === resp.classes_table?.cp_contact}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </button>
                          </button>
                          <button onClick={() => handleDelete(resp.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all" title="Delete Response">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
