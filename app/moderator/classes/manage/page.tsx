'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';

type ClassRow = Database['public']['Tables']['classes_table']['Row'];

type ClassStatus = 'active' | 'completed';

type ClassWithMetadata = ClassRow & {
  status?: ClassStatus;
};

export default function ClassesManagementPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') as 'ongoing' | 'finished' | null;
  const [supabase] = useState(() => createClient());
  const [classes, setClasses] = useState<ClassWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [filterFaculty, setFilterFaculty] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterProgram, setFilterProgram] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const prevRefreshKey = useRef(refreshKey);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getClassStatus = (endDate: string | null): ClassStatus => {
    if (!endDate) return 'active';
    const end = new Date(endDate);
    const now = new Date();
    return end < now ? 'completed' : 'active';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid';
    }
  };

  const fetchClasses = useCallback(async () => {
    if (prevRefreshKey.current !== refreshKey) {
      setLoading(true);
      prevRefreshKey.current = refreshKey;
    }

    try {
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(filterFaculty && { faculty: filterFaculty }),
        ...(filterDept && { department: filterDept }),
        ...(filterProgram && { program: filterProgram }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/moderator/classes?${params}`);
      
      if (!response.ok) {
        showToast('Failed to load classes', 'error');
        setClasses([]);
        return;
      }

      const result = await response.json();
      const classesWithStatus = (result.data || []).map((cls: ClassRow) => ({
        ...cls,
        status: getClassStatus(cls.end_date),
      }));
      setClasses(classesWithStatus);
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  }, [refreshKey, filterFaculty, filterDept, filterProgram, searchTerm, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('moderator_classes_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes_table' },
        () => {
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleDelete = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        showToast('Failed to delete class', 'error');
      } else {
        showToast('Class deleted successfully', 'success');
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error deleting class:', err);
      showToast('An error occurred while deleting', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      // Delete each class via API
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/classes/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const allSuccess = results.every(r => r.ok);

      if (!allSuccess) {
        showToast('Failed to delete some classes', 'error');
      } else {
        showToast(`${selectedIds.size} classes deleted successfully`, 'success');
        setSelectedIds(new Set());
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error during bulk delete:', err);
      showToast('An error occurred during bulk delete', 'error');
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  const handleToggleStatus = async (classId: string, currentStatus: ClassStatus | undefined) => {
    try {
      // Find the class to get its end_date
      const classToUpdate = classes.find((c) => c.id === classId);
      if (!classToUpdate) return;

      // Toggle status by updating end_date
      // Note: Classes with end_date in past are automatically deleted from database
      const now = new Date();
      let newEndDate: Date;

      if (currentStatus === 'active') {
        // Mark as inactive: set end_date to yesterday (will auto-delete)
        newEndDate = new Date(now.getTime() - 86400000);
      } else {
        // Mark as active: set end_date to 90 days from now
        newEndDate = new Date(now.getTime() + 90 * 86400000);
      }

      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: newEndDate.toISOString() }),
      });

      if (!response.ok) {
        showToast('Failed to update class status', 'error');
      } else {
        const statusText = currentStatus === 'active' ? 'marked for deletion (auto-delete in progress)' : 'reactivated';
        showToast(`Class ${statusText}`, 'success');
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('An error occurred', 'error');
    }
  };

  // Filter and sort classes
  const filteredClasses = classes
    .filter((cls) => {
      const matchesSearch =
        cls.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.lecturer?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFaculty = !filterFaculty || cls.faculty === filterFaculty;
      const matchesDept = !filterDept || cls.department === filterDept;
      const matchesProgram = !filterProgram || cls.program === filterProgram;
      return matchesSearch && matchesFaculty && matchesDept && matchesProgram;
    });

  const allVisibleSelected = filteredClasses.length > 0 && filteredClasses.every(cls => selectedIds.has(cls.id));

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allVisibleSelected) {
      filteredClasses.forEach(cls => newSelected.delete(cls.id));
    } else {
      filteredClasses.forEach(cls => newSelected.add(cls.id));
    }
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const uniqueDepartments = Array.from(
    new Set(classes.map((c) => c.department).filter(Boolean))
  ).sort();
  const uniqueFaculties = Array.from(
    new Set(classes.map((c) => c.faculty).filter(Boolean))
  ).sort();
  const uniquePrograms = Array.from(
    new Set(classes.map((c) => c.program).filter(Boolean))
  ).sort();

  return (
    <div className="min-h-screen bg-[#535350] p-4 md:p-6 w-full">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase">Manage Classes</h1>
          <p className="text-gray-400 text-sm mt-2">
            {statusFilter === 'ongoing' ? 'Ongoing Classes' : statusFilter === 'finished' ? 'Finished Classes' : 'Total Classes'}:{' '}
            <span className="font-semibold text-white">{filteredClasses.length}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2 animate-in fade-in zoom-in duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 2.991a1.11 1.11 0 0 0-1.106-.889h-7.108a1.11 1.11 0 0 0-1.106.889L6.929 6.75m15.75 12.75a4.5 4.5 0 0 1-4.5 4.5H4.5a4.5 4.5 0 0 1-4.5-4.5m15 0H3m16.5-11.25h.008v.008h-.008V8.75Z" />
              </svg>
              Delete ({selectedIds.size})
            </button>
          )}
          <Link
            href="/moderator/classes/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Class
          </Link>
          <Link
            href="/moderator/classes"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg font-medium transition-colors border border-gray-700"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Course name, lecturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Faculty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Faculty</label>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Faculties</option>
              {uniqueFaculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Program</label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Programs</option>
              {uniquePrograms.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterFaculty || filterDept || filterProgram) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterFaculty('');
              setFilterDept('');
              setFilterProgram('');
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading classes...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="mb-4">No classes found.</p>
            <Link
              href="/moderator/classes/create"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create the first class →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Course Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Faculty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Program</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Lecturer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls, index) => (
                  <tr
                    key={cls.id}
                    className={`border-b border-gray-700 hover:bg-gray-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'
                    } ${selectedIds.has(cls.id) ? 'bg-blue-600/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.has(cls.id)}
                        onChange={() => toggleSelect(cls.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      <div className="max-w-56 truncate" title={cls.course_name}>
                        {cls.course_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate">{cls.faculty || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate">{cls.department || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{cls.year_of_study || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate">{cls.program || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate">{cls.lecturer || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(cls.start_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(cls.end_date)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          cls.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : cls.status === 'completed'
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {cls.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          href={`/moderator/classes/${cls.id}/edit`}
                          title="Edit class"
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Link>

                        <Link
                          href={`/moderator/classes/create?duplicate=${cls.id}`}
                          title="Duplicate class"
                          className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                          </svg>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(cls.id, cls.status)}
                          title={cls.status === 'active' ? 'Mark as inactive' : 'Mark as active'}
                          className={`p-2 rounded-lg transition-colors ${
                            cls.status === 'active'
                              ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-500/30'
                              : 'bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(cls.id)}
                          title="Delete class"
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 2.991a1.11 1.11 0 0 0-1.106-.889h-7.108a1.11 1.11 0 0 0-1.106.889L6.929 6.75m15.75 12.75a4.5 4.5 0 0 1-4.5 4.5H4.5a4.5 4.5 0 0 1-4.5-4.5m15 0H3m16.5-11.25h.008v.008h-.008V8.75Z"
                            />
                          </svg>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Delete Class?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this class? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors border border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Delete Selected Classes?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {selectedIds.size} classes? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors border border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
