'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';
import { Database } from '@/lib/database.types';
import ConfirmModal from '@/components/ConfirmModal';
import { createClient } from '@/utils/supabase/client';
import Avatar from '@/components/Avatar';
import ChatModal, { ResponseWithProfile } from '@/components/ChatModal';

type RequestWithRelations = Database['public']['Tables']['announcement_requests_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
  phone?: string | null;
  announcement_responses_table: { user_id: string | null; seen: boolean | null }[];
};

interface RequestCardProps {
  request: RequestWithRelations;
  onRefresh?: () => void;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export default function RequestCard({ request, onRefresh, showToast }: RequestCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(request.content);
  const [editPhone, setEditPhone] = useState(request.phone || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ResponseWithProfile[]>([]);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const supabase = createClient();

  const isApproved = request.status === 'approved';
  const username = request.profiles_table?.username || 'Anonymous';
  const avatarLetter = username.startsWith('anon_')
    ? (username.charAt(5) || username.charAt(0)).toUpperCase()
    : username.charAt(0).toUpperCase();

  // Styles based on status
  const borderColor = isApproved
    ? 'border-green-900/30 hover:border-green-500/50'
    : 'border-blue-900/30 hover:border-blue-500/50';

  const statusColor = isApproved ? 'text-green-400' : 'text-blue-400';

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // 1. Update request status
      const { error: updateError } = await supabase
        .from('announcement_requests_table')
        .update({ status: 'approved', content: editContent, phone: editPhone || null })
        .eq('id', request.id);
      if (updateError) throw updateError;

      // 2. Create public announcement
      const { error: insertError } = await supabase
        .from('announcements_table')
        .insert({ message: editContent, phone: editPhone || null, request_id: request.id });
      if (insertError) throw insertError;

      setIsEditing(false);
      if (onRefresh) onRefresh();
      showToast?.('Request approved and published!', 'success');
    } catch (error) {
      showToast?.('Failed to approve request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('announcement_requests_table')
        .update({ status: 'rejected' })
        .eq('id', request.id);
      if (error) throw error;
      setShowRejectModal(false);
      if (onRefresh) onRefresh();
      showToast?.('Request rejected', 'success');
    } catch (error) {
      showToast?.('Failed to reject request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('announcement_requests_table')
        .delete()
        .eq('id', request.id);
      if (error) throw error;
      setShowDeleteModal(false);
      if (onRefresh) onRefresh();
      showToast?.('Request deleted', 'success');
    } catch (error) {
      showToast?.('Failed to delete request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('announcement_requests_table')
        .update({ content: editContent, phone: editPhone || null })
        .eq('id', request.id);
      if (error) throw error;
      setIsEditing(false);
      if (onRefresh) onRefresh();
      showToast?.('Request updated', 'success');
    } catch (error) {
      showToast?.('Failed to update request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.phone) {
      const cleanPhone = request.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.phone) {
      navigator.clipboard.writeText(request.phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const fetchChatMessages = async () => {
    const { data, error } = await supabase
      .from('announcement_responses_table')
      .select(`
        id, content, created_at, user_id, seen,
        profiles_table (username, avatar_url, role)
      `)
      .eq('request_id', request.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setChatMessages(data as unknown as ResponseWithProfile[]);
    }
  };

  const markAsSeen = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('announcement_responses_table')
      .update({ seen: true })
      .eq('request_id', request.id)
      .neq('user_id', user.id) // Mark messages NOT sent by me (the moderator)
      .eq('seen', false);

    if (!error && onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (showChatModal) {
      fetchChatMessages();
      markAsSeen();
    }
  }, [showChatModal]);

  // Realtime subscription for chat messages
  useEffect(() => {
    const channel = supabase
      .channel(`request-chat-${request.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_responses_table', filter: `request_id=eq.${request.id}` },
        () => {
          fetchChatMessages(); // Refetch messages for this specific chat
          if (onRefresh) onRefresh(); // Refresh the whole list to update unseen status
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, request.id, onRefresh]);

  useEffect(() => {
    const checkUnseen = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && request.announcement_responses_table) {
            const unseen = request.announcement_responses_table.some(
                (msg) => msg.user_id !== user.id && !msg.seen
            );
            setHasUnseen(unseen);
            if (unseen && showChatModal) {
              markAsSeen();
            }
        }
    };
    checkUnseen();
  }, [request.announcement_responses_table, supabase]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || '');
    };
    getCurrentUser();
  }, [supabase]);

  const handleSendReply = async (replyText: string) => {
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('announcement_responses_table')
      .insert({
        request_id: request.id,
        user_id: user.id,
        content: replyText
      });

    if (!error) {
      fetchChatMessages();
    }
  };

  return (
    <div className={`p-5 rounded-lg border transition-colors bg-gray-900 ${borderColor} group relative h-full flex flex-col`}>
      <div className="flex items-start gap-3 mb-4 relative z-10">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shrink-0 border border-gray-600 mt-1">
          <Avatar 
            url={request.profiles_table?.avatar_url} 
            alt={username}
            fallback={<span className="text-lg font-bold text-gray-300">{avatarLetter}</span>}
            imageClassName="w-full h-full object-cover"
            emojiClassName="text-xl leading-none"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-gray-200 truncate" title={username}>{username}</span>
            <div className="flex items-center gap-2">
              
              {/* Actions for Pending Requests */}
              {!isApproved && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-500 hover:text-blue-400 p-1 rounded hover:bg-gray-800 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="text-orange-500 hover:text-orange-400 p-1 rounded hover:bg-gray-800 transition-colors"
                    title="Reject"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="text-green-500 hover:text-green-400 p-1 rounded hover:bg-gray-800 transition-colors"
                    title="Approve"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* Delete Action (Always available) */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-gray-800 transition-colors"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            requested an announcement
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-8 flex-grow">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
            />
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(request.content);
                  setEditPhone(request.phone || '');
                }}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isProcessing}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
              >
                Save
              </button>
              {!isApproved && (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded"
                >
                  Approve & Publish
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-white text-lg whitespace-pre-wrap leading-relaxed font-medium break-words">
              {request.content}
            </p>
            {request.phone && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                  title="Chat on WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z"/>
                  </svg>
                  {request.phone}
                </button>
                <button
                  onClick={handleCopyPhone}
                  className="p-1.5 text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                  title="Copy Phone Number"
                >
                  {isCopied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.379 6H4.5Z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {!isApproved && (
          <button
            onClick={() => setShowChatModal(true)}
            className="relative text-purple-400 hover:text-purple-300 p-1.5 rounded-full hover:bg-gray-800 transition-colors"
            title="Quick Reply"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" /></svg>
            {hasUnseen && (
              <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900" />
            )}
          </button>
        )}
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 ${statusColor}`}>
          {request.status}
        </span>
        <span className="text-xs text-gray-500">{timeAgo(request.created_at || '')}</span>
      </div>

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        user={{
          username: username,
          avatarUrl: request.profiles_table?.avatar_url || null
        }}
        messages={chatMessages}
        currentUserId={currentUserId}
        onSendMessage={handleSendReply}
      />

      {/* Modals */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Request?"
          message="Are you sure you want to delete this request? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="DELETE"
          isDestructive={true}
        />
      )}

      {showRejectModal && (
        <ConfirmModal
          title="Reject Request?"
          message="Are you sure you want to reject this request? The user will not be notified, but the status will change."
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
          confirmText="REJECT"
          isDestructive={true}
        />
      )}
    </div>
  );
}