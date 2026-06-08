'use client';

import { useState, useRef } from 'react';
import { FACULTIES, DEPARTMENTS, YEARS_OF_STUDY, PROGRAMS } from '@/lib/constants';

export type ClassFiltersState = {
  faculty: string;
  department: string;
  program: string;
  year_of_study: string;
};

type ClassFiltersProps = {
  filters: ClassFiltersState;
  onChange: (filters: ClassFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
};

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  disabled = false,
  placeholder = "All"
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <label className="block text-lg  tracking-wide text-white/80 uppercase mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-[#121c31] border border-white/10 rounded-md px-3 h-11 text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-300/60 active:scale-[0.99]'}
          ${isOpen ? 'ring-1 ring-cyan-300/60 border-cyan-300/60 shadow-[0_0_15px_rgba(103,232,249,0.1)]' : ''}`}
      >
        <span className={`${!value ? 'text-gray-500' : 'text-white'} truncate text-lg font-medium`}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute z-20 w-full mt-1 bg-[#121c31] border border-white/10 rounded-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                onChange('');
                onToggle();
              }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5
                ${!value ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-400 italic'}`}
            >
              All
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  onToggle();
                }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5
                  ${value === opt.value ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ClassFilters({ filters, onChange, onApply, onReset }: ClassFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const setFilter = (key: keyof ClassFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Dynamically get departments based on selected faculty
  const availableDepartments = filters.faculty ? DEPARTMENTS[filters.faculty] || [] : [];

  return (
    <aside className="rounded-lg border border-white/10 bg-gray-800 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-extrabold text-white">Filters</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
          title={isExpanded ? "Collapse filters" : "Expand filters"}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mt-5 grid gap-4">
            <CustomDropdown
              label="Faculty"
              value={filters.faculty}
              options={FACULTIES.map(f => ({ label: f, value: f }))}
              isOpen={activeDropdown === 'faculty'}
              onToggle={() => toggleDropdown('faculty')}
              onChange={(value) => {
                onChange({
                  ...filters,
                  faculty: value,
                  department: '',
                  program: '',
                });
              }}
            />
            <CustomDropdown
              label="Department"
              value={filters.department}
              options={availableDepartments.map(d => ({ label: d, value: d }))}
              disabled={!filters.faculty}
              isOpen={activeDropdown === 'department'}
              onToggle={() => toggleDropdown('department')}
              onChange={(value) => {
                onChange({
                  ...filters,
                  department: value,
                  program: '',
                });
              }}
            />
            <CustomDropdown
              label="Program"
              value={filters.program}
              options={PROGRAMS.map(p => ({ label: p, value: p }))}
              isOpen={activeDropdown === 'program'}
              onToggle={() => toggleDropdown('program')}
              onChange={(value) => setFilter('program', value)}
            />
            <CustomDropdown
              label="Year of study"
              value={filters.year_of_study}
              options={YEARS_OF_STUDY.map(y => ({ label: `Year ${y}`, value: y }))}
              isOpen={activeDropdown === 'year'}
              onToggle={() => toggleDropdown('year')}
              onChange={(value) => setFilter('year_of_study', value)}
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onReset}
              className="h-11 flex-1 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                setIsExpanded(false);
              }}
              className="h-11 flex-[2] rounded-md bg-blue-400 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-blue-300"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
