'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { FACULTIES, DEPARTMENTS, PROGRAMS, YEARS_OF_STUDY, INTAKE_MONTHS } from '@/lib/constants';

function CreateClassForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    course_name: '',
    faculty: '',
    department: '',
    year_of_study: '',
    program: '',
    intake: '',
    lecturer: '',
    start_date: '',
    end_date: '',
    cat_date: '',
    exam_date: '',
    classroom: '',
    whatsapp_link: '',
    cp_contact: '',
  });

  const duplicateId = searchParams.get('duplicate');

  useEffect(() => {
    if (duplicateId) {
      const fetchClassToDuplicate = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('classes_table')
            .select('*')
            .eq('id', duplicateId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              course_name: `${data.course_name} (Copy)`,
              faculty: data.faculty || '',
              department: data.department || '',
              year_of_study: data.year_of_study || '',
              program: data.program || '',
              intake: data.intake || '',
              lecturer: data.lecturer || '',
              start_date: data.start_date || '',
              end_date: data.end_date || '',
              cat_date: data.cat_date || '',
              exam_date: data.exam_date || '',
              classroom: data.classroom || '',
              whatsapp_link: data.whatsapp_link || '',
              cp_contact: data.cp_contact || '',
            });
          }
        } catch (error: any) {
          console.error('Error fetching class to duplicate:', error);
          showToast('Failed to load original class data', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchClassToDuplicate();
    }
  }, [duplicateId, supabase]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('classes_table')
        .insert([
          {
            ...formData,
            whatsapp_link: formData.whatsapp_link || null,
            cp_contact: formData.cp_contact || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            cat_date: formData.cat_date || null,
            exam_date: formData.exam_date || null,
          },
        ]);

      if (error) throw error;

      showToast('Class created successfully!', 'success');
    } catch (error: any) {
      console.error('Error creating class:', error);
      showToast(error.message || 'Failed to create class', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1";

  if (loading) return <div className="min-h-screen bg-[#535350] flex items-center justify-center text-white">Loading class...</div>;

  return (
    <div className="min-h-screen bg-[#535350] p-4 md:p-6 w-full">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Create New Class</h1>
          <Link href="/moderator/classes" className="text-gray-400 hover:text-white flex items-center gap-2">
            Back to classes
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl shadow-2xl p-5 md:p-8 border border-gray-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Course Name *</label>
              <input type="text" name="course_name" required value={formData.course_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Faculty *</label>
              <select 
                name="faculty" 
                required 
                value={formData.faculty} 
                onChange={(e) => {
                  handleChange(e);
                  setFormData(prev => ({ ...prev, department: '' }));
                }} 
                className={inputClass}
              >
                <option value="">Select Faculty</option>
                {FACULTIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lecturer Name</label>
              <input type="text" name="lecturer" value={formData.lecturer} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Department *</label>
              <select 
                name="department" 
                required 
                value={formData.department} 
                onChange={handleChange} 
                className={inputClass}
                disabled={!formData.faculty}
              >
                <option value="">Select Department</option>
                {(DEPARTMENTS[formData.faculty] || []).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Program *</label>
              <select name="program" required value={formData.program} onChange={handleChange} className={inputClass}>
                <option value="">Select Program</option>
                {PROGRAMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Year of Study *</label>
              <select name="year_of_study" required value={formData.year_of_study} onChange={handleChange} className={inputClass}>
                <option value="">Select Year</option>
                {YEARS_OF_STUDY.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Intake *</label>
              <select name="intake" required value={formData.intake} onChange={handleChange} className={inputClass}>
                <option value="">Select Intake</option>
                {INTAKE_MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CAT Date</label>
              <input type="date" name="cat_date" value={formData.cat_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Exam Date</label>
              <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            <div className="md:col-span-2">
              <label className={labelClass}>Classroom Location</label>
              <input type="text" name="classroom" placeholder="e.g. Room 204, Main Campus" value={formData.classroom} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Group Link</label>
              <input type="text" name="whatsapp_link" placeholder="https://chat.whatsapp.com/..." value={formData.whatsapp_link} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CP Contact Number</label>
              <input type="text" name="cp_contact" placeholder="e.g. +250..." value={formData.cp_contact} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 rounded-xl font-bold text-white uppercase tracking-widest ${saving ? 'bg-gray-700' : 'bg-blue-600'}`}
            >
              {saving ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateClassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#535350] flex items-center justify-center text-white">
        Loading...
      </div>
    }>
      <CreateClassForm />
    </Suspense>
  );
}