'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { UniversityClass } from '@/lib/types';
import { FACULTIES, DEPARTMENTS, PROGRAMS, YEARS_OF_STUDY } from '@/lib/constants';

type SurveyFormProps = {
  onClose: () => void;
  onSuccess: () => void;
};

interface DropdownProps {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
}

function CustomDropdown({ id, label, value, options, onChange, disabled, placeholder, isOpen, onToggle }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;
 
  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-lg font-bold text-white mb-2  tracking-tight">
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-black/40 border border-white/70 rounded-xl px-4 py-4 text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/50 active:scale-[0.99]'}
          ${isOpen ? 'ring-2 ring-cyan-500/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : ''}`}
      >
        <span className={`${!value ? 'text-gray-500' : 'text-white'} truncate font-medium`}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={onToggle}
          />
          <div className="absolute z-20 w-full mt-2 bg-[#121c31] border border-green-500 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 italic">No courses available, try later</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    onToggle();
                  }}
                  className={`w-full text-left px-4 py-5 text-base transition-colors hover:bg-cyan-500/10 hover:text-cyan-400
                    ${value === opt.value ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SurveyForm({ onClose, onSuccess }: SurveyFormProps) {
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [intake, setIntake] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [cpContact, setCpContact] = useState('');

  const [availableCourses, setAvailableCourses] = useState<UniversityClass[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Dynamically get available departments based on selected faculty
  const availableDepartments = faculty ? DEPARTMENTS[faculty] || [] : [];

  // Fetch filtered courses based on all selections
  useEffect(() => {
    if (!faculty || !department || !program || !yearOfStudy || !intake) {
      setAvailableCourses([]);
      return;
    }

    async function fetchCourses() {
      setIsLoadingCourses(true);
      setError('');
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('classes_table')
          .select('*')
          .eq('faculty', faculty)
          .eq('department', department)
          .eq('program', program)
          .eq('year_of_study', yearOfStudy)
          .eq('intake', intake)
          .gte('end_date', today)
          .order('course_name', { ascending: true });

        if (error) throw error;
        setAvailableCourses((data || []) as UniversityClass[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available courses';
        setError(`Failed to fetch available courses: ${errorMessage}`);
        setAvailableCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [faculty, department, program, yearOfStudy, intake]);

  const handleCourseChange = (val: string) => {
    setCourseId(val);
    const selected = availableCourses.find(c => c.id === val);
    if (selected) {
      setCourseName(selected.course_name);
    } else {
      setCourseName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!faculty || !department || !program || !yearOfStudy || !intake || !courseId || !cpContact) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: submitError } = await supabase
        .from('survey_responses_table')
        .insert({
          user_id: null,
          course_id: courseId,
          course_name: courseName,
          department: department,
          program: program,
          intake: intake,
          cp_contact: cpContact,
        });

      if (submitError) throw submitError;
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit survey';
      setError(`Failed to submit survey: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#496a97] via-[#142c3f] to-[#161a18] border border-white/5 rounded-2xl shadow-2xl text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">TELL US ABOUT YOU</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <CustomDropdown
          id="faculty"
          label="1. What faculty are you in?"
          placeholder="Select Faculty"
          value={faculty}
          isOpen={activeDropdown === 'faculty'}
          onToggle={() => setActiveDropdown(activeDropdown === 'faculty' ? null : 'faculty')}
          options={FACULTIES.map(f => ({ label: f, value: f }))}
          onChange={(val) => {
            setFaculty(val);
            setDepartment('');
            setProgram('');
            setYearOfStudy('');
            setIntake('');
            setCourseId('');
          }}
        />

        <CustomDropdown
          id="department"
          label="2. What department are you in?"
          placeholder="Select Department"
          value={department}
          disabled={!faculty}
          isOpen={activeDropdown === 'department'}
          onToggle={() => setActiveDropdown(activeDropdown === 'department' ? null : 'department')}
          options={availableDepartments.map(d => ({ label: d, value: d }))}
          onChange={(val) => {
            setDepartment(val);
            setProgram('');
            setYearOfStudy('');
            setIntake('');
            setCourseId('');
          }}
        />

        <CustomDropdown
          id="program"
          label="3. What program are you in?"
          placeholder="Select Program"
          value={program}
          disabled={!department}
          isOpen={activeDropdown === 'program'}
          onToggle={() => setActiveDropdown(activeDropdown === 'program' ? null : 'program')}
          options={PROGRAMS.map(p => ({ label: p, value: p }))}
          onChange={(val) => {
            setProgram(val);
            setYearOfStudy('');
            setIntake('');
            setCourseId('');
          }}
        />

        <CustomDropdown
          id="year"
          label="4. What year of study are you?"
          placeholder="Select Year"
          value={yearOfStudy}
          disabled={!program}
          isOpen={activeDropdown === 'year'}
          onToggle={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
          options={YEARS_OF_STUDY.map(y => ({ label: `Year ${y}`, value: y }))}
          onChange={(val) => {
            setYearOfStudy(val);
            setIntake('');
            setCourseId('');
          }}
        />

        <CustomDropdown
          id="intake"
          label="5. What intake are you in?"
          placeholder="Select Intake"
          value={intake}
          disabled={!yearOfStudy}
          isOpen={activeDropdown === 'intake'}
          onToggle={() => setActiveDropdown(activeDropdown === 'intake' ? null : 'intake')}
          options={['Jan', 'May', 'Sep'].map(m => ({ label: m, value: m }))}
          onChange={(val) => {
            setIntake(val);
            setCourseId('');
          }}
        />

        <CustomDropdown
          id="course"
          label="6. What course are you taking?"
          placeholder={isLoadingCourses ? 'Loading courses...' : 'Select Course'}
          value={courseId}
          disabled={!intake || isLoadingCourses}
          isOpen={activeDropdown === 'course'}
          onToggle={() => setActiveDropdown(activeDropdown === 'course' ? null : 'course')}
          options={availableCourses.map(c => ({ 
            label: `${c.course_name} (Lecturer: ${c.lecturer || 'TBA'})`, 
            value: c.id 
          }))}
          onChange={handleCourseChange}
        />

        <div>
          <label htmlFor="cpContact" className="block text-lg font-bold text-white mb-2 tracking-tight">7. Your CP phone number</label>
          <input
            type="tel"
            id="cpContact"
            value={cpContact}
            onChange={(e) => setCpContact(e.target.value)}
            className="w-full bg-black/40 border border-white/70 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium"
            placeholder="+250 7XX XXX XXX"
            required
          />
        </div>
              {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium mb-6 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 text-sm font-bold text-white rounded-xl bg-white/35 hover:bg-white/10 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCourses}
            className="px-8 py-3.5 text-sm font-black rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg shadow-cyan-900/20 active:scale-95"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Info'}
          </button>
        </div>
      </form>
    </div>
  );
}