'use client';

import { useState } from 'react';
import { Database } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';
import ConfirmModal from '@/components/others/ConfirmModal';

type Announcement = Database['public']['Tables']['announcements_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
};

interface RequestCardProps {
  request: Announcement;
  onRefresh?: () => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export default function RequestCard({ request, onRefresh, showToast }: RequestCardProps) {
  const [supabase] = useState(() => createClient());
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(request.message);
  const [phone, setPhone] = useState(request.phone || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveEdit = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('announcements_table').update({ message, phone: phone || null }).eq('id', request.id);
    setIsProcessing(false);
    if (error) showToast?.('Failed to update announcement', 'error');
    else {
      setIsEditing(false);
      onRefresh?.();
      showToast?.('Announcement updated', 'success');
    }
  };

  const deleteAnnouncement = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('announcements_table').delete().eq('id', request.id);
    setIsProcessing(false);
    if (error) showToast?.('Failed to delete announcement', 'error');
    else {
      setShowDeleteModal(false);
      onRefresh?.();
      showToast?.('Announcement deleted', 'success');
    }
  };

  return (
    <article className="relative flex h-full flex-col rounded-lg border border-blue-900/30 bg-gray-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-200">{request.profiles_table?.username || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">Published announcement</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1 text-blue-400 hover:text-blue-300" title="Edit">EDIT</button>
          <button onClick={() => setShowDeleteModal(true)} className="p-1 text-red-400 hover:text-red-300" title="Delete">DELETE</button>
        </div>
      </div>
      <div className="grow">
        {isEditing ? (
          <div className="space-y-3">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded border border-gray-700 bg-gray-800 p-3 text-white" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number (optional)" className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-gray-400">Cancel</button>
              <button onClick={saveEdit} disabled={isProcessing} className="rounded bg-blue-600 px-3 py-1 text-white">Save</button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap wrap-break-word text-lg leading-relaxed text-white">{request.message}</p>
            {request.phone && <p className="mt-3 text-sm text-gray-400">WhatsApp: {request.phone}</p>}
          </>
        )}
      </div>
      <p className="mt-6 text-right text-xs text-gray-500">{request.created_at ? new Date(request.created_at).toLocaleString() : ''}</p>
      {showDeleteModal && (
        <ConfirmModal title="Delete Announcement?" message="This announcement will be removed from the community." onConfirm={deleteAnnouncement} onCancel={() => setShowDeleteModal(false)} confirmText="DELETE" isDestructive />
      )}
    </article>
  );
}
