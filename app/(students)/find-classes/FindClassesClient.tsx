'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ClassCard from '@/components/students/classes/ClassCard';
import ClassFilters, { ClassFiltersState } from '@/components/students/classes/ClassFilters';
import ClassSearchBar from '@/components/students/classes/ClassSearchBar';
import { ClassFilterOptions, UniversityClass } from '@/lib/types';

const PAGE_SIZE = 9;

const emptyFilters: ClassFiltersState = {
  faculty: '',
  department: '',
  program: '',
  year_of_study: '',
};

type ClassesResponse = {
  classes: UniversityClass[];
  total: number;
  limit: number;
  offset: number;
  options: ClassFilterOptions;
};

const fallbackOptions: ClassFilterOptions = {
  programs: [],
};

function SkeletonCard() {
  return (
    <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-[#202623] p-5">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="mt-4 h-7 w-3/4 rounded bg-white/10" />
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="h-14 rounded bg-white/10" />
        <div className="h-14 rounded bg-white/10" />
        <div className="h-14 rounded bg-white/10" />
        <div className="h-14 rounded bg-white/10" />
      </div>
      <div className="mt-7 h-10 w-32 rounded bg-white/10" />
    </div>
  );
}

export default function FindClassesClient() {
  const [classes, setClasses] = useState<UniversityClass[]>([]);
  const [filters, setFilters] = useState<ClassFiltersState>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ClassFiltersState>(emptyFilters);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
      sort: 'updated',
    });

    if (appliedSearch.trim()) params.set('search', appliedSearch.trim());

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    try {
      const response = await fetch(`/api/classes?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load classes');
      }

      const data = payload as ClassesResponse;
      setClasses(data.classes);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
      setClasses([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, appliedSearch, page]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const suggestions = useMemo(() => {
    const values = classes.flatMap((item) => [
      item.course_name,
      item.faculty,
      item.department,
      item.program,
      item.lecturer || '',
    ]);
    return Array.from(new Set(values.filter(Boolean))).slice(0, 20);
  }, [classes]);

  const applySearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <ClassSearchBar
        value={search}
        suggestions={suggestions}
        onChange={setSearch}
        onSubmit={applySearch}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ClassFilters
          filters={filters}
          onChange={setFilters}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        <section className="min-w-0">
          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1">
              {isLoading ? (
            <div className={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : classes.length > 0 ? (
            <div className={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {classes.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} compact={view === 'list'} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#202623] p-8 text-center">
              <h2 className="text-xl font-extrabold text-white">No courses found</h2>
              <p className="mx-auto mt-2 max-w-lg text-lg leading-6 text-white/800">
                Try a different course name or use filters</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Clear search
              </button>
            </div>
          )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <p className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
