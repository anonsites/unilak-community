'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface JSONImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JSONImportModal({ isOpen, onClose, onSuccess }: JSONImportModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      try {
        data = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON format. Please check your syntax.');
      }
      
      // Ensure it's an array or a single object converted to an array
      const classesToInsert = Array.isArray(data) ? data : [data];

      if (classesToInsert.length === 0) {
        throw new Error('No data found in JSON');
      }

      const { error: insertError } = await supabase
        .from('classes_table')
        .insert(classesToInsert);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setJsonInput('');
    } catch (err: unknown) {
      console.error('Error importing JSON:', err);
      setError(err instanceof Error ? err.message : 'Database error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Import Classes via JSON</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Side: Descriptions and Errors */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-white font-bold mb-2">Instructions</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Paste your JSON class data into the field. Ensure fields match the database schema precisely:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['course_name', 'faculty', 'department', 'year_of_study', 'program', 'intake', 'lecturer', 'start_date', 'end_date', 'cat_date', 'exam_date', 'classroom', 'whatsapp_link', 'cp_contact'].map(field => (
                    <span key={field} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-blue-400">{field}</span>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-xs">Error</span>
                  </div>
                  {error}
                </div>
              )}
            </div>

            {/* Right Side: Input Field */}
            <div className="md:col-span-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-[450px] bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-800 resize-none shadow-inner"
                spellCheck={false}
                placeholder={`[
  {
    "course_name": "Example Course",
    "faculty": "CIS",
    "department": "IT",
    "year_of_study": "2",
    "program": "Day",
    "intake": "Sep",
    "lecturer": "Dr. Doe",
    "start_date": "2024-09-01",
    "end_date": "2024-12-20",
    "cat_date": "2024-10-15",
    "exam_date": "2024-12-15",
    "classroom": "Room 204",
    "whatsapp_link": "https://chat.whatsapp.com/...",
    "cp_contact": "+250..."
  }
]`}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-colors border border-white/5"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !jsonInput.trim()}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {loading ? 'Processing Import...' : 'Confirm & Save Classes'}
          </button>
        </div>
      </div>
    </div>
  );
}