'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import Avatar from '@/components/Avatar';
import ConfirmModal from '@/components/ConfirmModal';
import ChatModal from '@/components/ChatModal';
import SubmissionModal from '@/components/SubmissionModal';
import DonationModal from '@/components/DonationModal';

type AnnouncementRequestWithRelations = Database['public']['Tables']['announcement_requests_table']['Row'] & {
  announcement_responses_table: { id: string; content: string; created_at: string; user_id: string; seen: boolean; profiles_table: { username: string; avatar_url: string | null; role: string | null } | null }[];
  announcements_table: {
    id: string;
    announcement_responses_table: {
      id: string;
      content: string;
      created_at: string;
      user_id: string;
      seen: boolean;
      profiles_table: { username: string; avatar_url: string | null; role: string | null } | null;
    }[];
  }[];
};

export default function AnnouncementPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<AnnouncementRequestWithRelations[]>([]);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [activeChatRequest, setActiveChatRequest] = useState<AnnouncementRequestWithRelations | null>(null);
  const [communityChatResponses, setCommunityChatResponses] = useState<AnnouncementRequestWithRelations['announcements_table'][0]['announcement_responses_table'] | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        // Optional: Redirect immediately if you want to enforce login to view
        // router.push('/login'); 
      }
    };
    checkUser();
  }, [router, supabase]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('announcement_requests_table')
      .select(`
        *,
        announcement_responses_table (
          id, content, created_at, user_id, seen, profiles_table (username, avatar_url, role)
        ),
        announcements_table (
          id,
          announcement_responses_table (
            id,
            content,
            created_at,
            user_id,
            seen,
            profiles_table (username, avatar_url, role)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setRequests(data as AnnouncementRequestWithRelations[]);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription to keep chat and requests in sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('announcement_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_responses_table' },
        () => {
          fetchRequests();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_requests_table', filter: `user_id=eq.${user.id}` },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchRequests]);

  // Sync active chat with the main requests list after refetching
  useEffect(() => {
    if (activeChatRequest) {
      const updatedRequest = requests.find(req => req.id === activeChatRequest.id);
      if (updatedRequest) {
        setActiveChatRequest(updatedRequest);
      }
    }
  }, [requests, activeChatRequest]);

  // Auto-mark messages as seen when chat is open
  useEffect(() => {
    if (activeChatRequest && user) {
      const unseenIds = activeChatRequest.announcement_responses_table
        .filter(msg => msg.user_id !== user.id && !msg.seen)
        .map(msg => msg.id);

      if (unseenIds.length > 0) {
        supabase
          .from('announcement_responses_table')
          .update({ seen: true })
          .in('id', unseenIds)
          .then(({ error }) => {
            if (error) console.error('Error marking messages as seen:', error);
            else fetchRequests();
          });
      }
    }
  }, [activeChatRequest, user, supabase]);

  const handleDeleteResponse = async () => {
    if (!responseToDelete) return;
    try {
      const { error } = await supabase
        .from('announcement_responses_table')
        .delete()
        .eq('id', responseToDelete);
      
      if (error) throw error;
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Failed to delete response');
    } finally {
      setResponseToDelete(null);
    }
  };

  const handleSendReply = async (text: string) => {
    if (!activeChatRequest || !user) return;

    const { error } = await supabase
      .from('announcement_responses_table')
      .insert({
        request_id: activeChatRequest.id,
        user_id: user.id,
        content: text
      });

    if (!error) {
      fetchRequests();
    }
  };

  const openChat = async (req: AnnouncementRequestWithRelations) => {
    setActiveChatRequest(req);
    
    // Mark messages as seen when opening chat
    if (!user) return;
    const unseenIds = req.announcement_responses_table
      .filter(msg => msg.user_id !== user.id && !msg.seen)
      .map(msg => msg.id);

    if (unseenIds.length > 0) {
      await supabase
        .from('announcement_responses_table')
        .update({ seen: true })
        .in('id', unseenIds);
      
      fetchRequests();
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    try {
      const { error } = await supabase
        .from('announcement_requests_table')
        .delete()
        .eq('id', requestToDelete);
      
      if (error) throw error;
      toast.success('Request cancelled successfully');
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to cancel request');
    } finally {
      setRequestToDelete(null);
    }
  };

  const handleSubmit = async (description: string, phoneNumber: string) => {
    if (!user) {
      toast.error('You must be logged in to submit an announcement.');
      // router.push('/login'); // Redirect to login page
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('announcement_requests_table')
        .insert({
          content: description,
          phone: phoneNumber,
          user_id: user.id,
        });

      if (error) throw error;
      toast.success('Announcement request submitted successfully! We will contact you shortly.');
      setShowModal(false);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error((error as Error)?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans relative">
      {/* MINIMIZED HEADER */}
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 px-4 md:px-8 flex items-center justify-center sticky top-0 z-40 backdrop-blur-md relative">
        <h1 className="text-xl font-bold tracking-wider text-white">MY ANNOUNCEMENT</h1>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        {user ? (
          <div className="space-y-6">       
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests && requests.length > 0 ? (
                requests.map((req) => {
                  const hasUnseen = req.announcement_responses_table.some(
                    msg => msg.user_id !== user.id && !msg.seen
                  );
                  const hasModMessages = req.announcement_responses_table.some(
                    msg => msg.profiles_table?.role === 'moderator'
                  );
                  const isExpanded = expandedRequests.has(req.id);
                  const shouldTruncate = req.content.length > 150;
                  const communityResponses = req.announcements_table?.[0]?.announcement_responses_table || [];
                  const latestResponse = communityResponses.length > 0 ? communityResponses[communityResponses.length - 1] : null;


                  return (
                  <div key={req.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors relative shadow-sm">
                    {(req.status === 'pending' || req.status === 'approved') && (
                      <div className="absolute top-3 right-3 group z-20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 hover:text-white cursor-help">
                          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                        </svg>
                        
                        <div className="absolute right-0 top-6 w-64 p-3 bg-black/90 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 pointer-events-none">
                          <p className="text-xs text-gray-300 leading-relaxed text-center">
                            {req.status === 'pending' 
                              ? 'Our team is reviewing your request! Donate to make it faster.'
                              : 'Your announcement is live, the community is watching'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-3 pr-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        req.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {req.status}
                      </span>
                      {req.announcements_table?.[0]?.announcement_responses_table?.length > 0 && (
                        <span className="ml-auto mr-3 text-[10px] font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                          </svg>
                          {req.announcements_table[0].announcement_responses_table.length}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-white/80 text-lg leading-relaxed wrap-break-words whitespace-pre-wrap inline">
                        {shouldTruncate && !isExpanded ? `${req.content.slice(0, 150)}...` : req.content}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => setExpandedRequests(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(req.id)) newSet.delete(req.id);
                            else newSet.add(req.id);
                            return newSet;
                          })}
                          className="text-blue-400 hover:text-blue-300 text-xs font-bold ml-1 hover:underline"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </div>

                    {req.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-400 mb-3">
                        {hasModMessages
                          ? 'Your announcement is pending, chat with admin to publish'
                          : 'Your announcement is under review, admin will message you for follow-up if needed'}
                      </p>
                      <div className="flex justify-between items-center min-h-11">
                      {/* Chat Button for Pending Requests */}
                      {hasModMessages && (
                        <button
                          onClick={() => openChat(req)}
                          className="text-lg font-bold text-green-400 hover:text-green-300 border border-green-500/50 hover:border-green-400 px-3 py-2 rounded transition-colors flex items-center gap-2 relative"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                          </svg>
                          CHAT WITH ADMIN
                          {hasUnseen && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          )}
                        </button>
                      )}

                      {/* Cancel Button for Pending Requests */}
                        <button
                          onClick={() => setRequestToDelete(req.id)}
                          className="text-red-400 hover:text-red-300 text-lg font-bold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded ml-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>
                          CANCEL
                        </button>
                      </div>
                    </div>
                    )}
                    {/* Community Responses for Approved Requests */}
                    {req.status === 'approved' && latestResponse && (
                      <div className="mt-6 pt-4 border-t border-gray-800">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Community Responses</h4>
                        <button 
                          onClick={() => setCommunityChatResponses(communityResponses)}
                          className="w-full text-left p-3 bg-yellow-950/50 rounded-lg hover:bg-yellow-900/50 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex-1 p-5 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                <Avatar 
                                  url={latestResponse.profiles_table?.avatar_url} 
                                  alt={latestResponse.profiles_table?.username || 'Unknown'}
                                  fallback={<span className="text-[10px] font-bold text-gray-400">?</span>}
                                  imageClassName="w-full h-full object-cover"
                                  emojiClassName="text-lg leading-none"
                                />
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-bold text-blue-400">@{latestResponse.profiles_table?.username || 'Unknown'}</span>
                                {communityResponses.length > 1 && <span className="text-xs text-gray-400">and {communityResponses.length} others</span>}
                              </div>
                            </div>
                            <p className="text-lg text-white truncate">{latestResponse.content}</p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors ml-2 shrink-0">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })
              ) : (
                <div className="md:col-span-2 flex flex-col items-center justify-center pt-32 pb-24 px-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner mt-8">
                  <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center mb-6 border border-orange-400 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14 text-white/80">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.43.816 1.035.816 1.73 0 .695-.32 1.3-.816 1.73" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No announcements yet</h3>
                  <p className="text-center max-w-xs leading-relaxed">
                    Share something with the community by creating your first announcement.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 flex flex-col items-center justify-center pt-32 pb-24 px-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner mt-8">
            <p className="text-white mb-4">Please join community to create and manage your announcements.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth" className="rounded-lg bg-blue-600 px-5 py-3 text-lg font-bold text-white transition hover:bg-blue-500">
              Join Community
              </Link>
              </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (!user) {
            toast.error('You must be logged in to create an announcement');
            return;
          }
          setShowPricing(true);
        }}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-full shadow-2xl transition-all hover:scale-105 z-40 flex items-center gap-2 font-bold tracking-wider"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        CREATE
      </button>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onContinue={() => {
          setShowPricing(false);
          setShowModal(true);
        }}
      />

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ChatModal
        isOpen={!!activeChatRequest}
        onClose={() => setActiveChatRequest(null)}
        user={{
          username: 'Community_admin',
          avatarUrl: null
        }}
        messages={activeChatRequest?.announcement_responses_table || []}
        currentUserId={user?.id || ''}
        onSendMessage={handleSendReply}
      />

      <ChatModal
        isOpen={!!communityChatResponses}
        onClose={() => setCommunityChatResponses(null)}
        user={{
          username: 'Community responses',
          avatarUrl: null
        }}
        messages={communityChatResponses || []}
        currentUserId={user?.id || ''}
        onSendMessage={async () => {}}
        disableInput={true}
      />

      {responseToDelete && (
        <ConfirmModal
          title="Delete Response?"
          message="Are you sure you want to delete this response?"
          onConfirm={handleDeleteResponse}
          onCancel={() => setResponseToDelete(null)}
          confirmText="DELETE"
          isDestructive={true}
        />
      )}

      {requestToDelete && (
        <ConfirmModal
          title="Cancel Request?"
          message="Are you sure you want to cancel this announcement request? This action cannot be undone."
          onConfirm={handleDeleteRequest}
          onCancel={() => setRequestToDelete(null)}
          confirmText="CANCEL REQUEST"
          isDestructive={true}
        />
      )}

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}