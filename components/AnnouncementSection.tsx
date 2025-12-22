'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Avatar from './Avatar';
import ChatModal, { ResponseWithProfile } from './ChatModal';
import toast from 'react-hot-toast';

type AnnouncementItem = {
  id?: string | null;
  message?: string | null;
  phone?: string | null;
  created_at?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  ownerId?: string | null;
  responseCount?: number;
};

interface AnnouncementSectionProps {
  announcements: AnnouncementItem[];
  currentUserId?: string | null;
  currentUserProfile?: { username: string | null; avatar_url: string | null; } | null;
  isLoading?: boolean;
  variant?: 'slider' | 'feed';
}

const BG_COLORS = [
  'bg-teal-900',
  'bg-emerald-900',
  'bg-sky-900',
  'bg-stone-800',
  'bg-slate-900',
];

export default function AnnouncementSection({ announcements, currentUserId, currentUserProfile, isLoading, variant = 'slider' }: AnnouncementSectionProps) {
  const supabase = createClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sentMessages, setSentMessages] = useState<ResponseWithProfile[]>([]);

  const currentAnnouncement = announcements[currentIndex] || {};
  const { id, message, phone, created_at, username, avatarUrl, ownerId, responseCount } = currentAnnouncement;

  // Effect for cycling announcements
  useEffect(() => {
    if (variant === 'feed' || announcements.length <= 1 || isPaused || showModal) return;

    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % announcements.length);
      setIsExpanded(false);
    }, 20000); // 20 seconds

    return () => clearInterval(intervalId);
  }, [announcements.length, isPaused, showModal, variant]);

  const handleSubmitResponse = async (text: string) => {
    if (!text.trim() || !id) return;
    
    const newMessage: ResponseWithProfile = {
      id: `temp-${crypto.randomUUID()}`,
      content: text,
      created_at: new Date().toISOString(),
      user_id: currentUserId || '',
      seen: true,
      profiles_table: {
        username: currentUserProfile?.username || 'User',
        avatar_url: currentUserProfile?.avatar_url || null,
        role: null
      }
    };
    setSentMessages(prev => [...prev, newMessage]);

    const { error } = await supabase
      .from('announcement_responses_table')
      .insert({
        announcement_id: id,
        user_id: currentUserId || null,
        content: text
      });

    if (error) {
      console.error(error);
      toast.error('Failed to submit response. Please try again.');
      setSentMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } else {
      toast.success('Response submitted successfully!');
    }
  };

  const handleOpenWhatsApp = (phoneNumber: string | null | undefined) => {
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const currentColor = BG_COLORS[currentIndex % BG_COLORS.length];
  const MAX_LENGTH = 150;
  const shouldTruncate = message && message.length > MAX_LENGTH;

  if (isLoading) {
    return (
      <section className="relative border-l-4 border-green-500 pl-4 py-6 flex flex-col justify-center rounded-r-xl bg-gray-800 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-700 ring-2 ring-cyan-500/50 shrink-0"></div>
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-gray-700 rounded-lg"></div>
          <div className="h-8 w-32 bg-gray-700 rounded-lg"></div>
        </div>
      </section>
    );
  }

  return (
    <>
    {variant === 'feed' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann, index) => {
          const cardColor = BG_COLORS[index % BG_COLORS.length];
          return (
            <div key={ann.id} className={`relative border-l-4 border-green-500 pl-4 py-6 flex flex-col rounded-r-xl ${cardColor} h-full`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-cyan-500/50 shrink-0">
                    <Avatar 
                      url={ann.avatarUrl} 
                      alt={ann.username || 'User'}
                      fallback={<span className="text-xs font-bold text-white">{(ann.username || 'A').charAt(0).toUpperCase()}</span>}
                      imageClassName="w-full h-full object-cover"
                      emojiClassName="text-lg leading-none"
                    />
                  </div>
                </div>
                <h2 className="text-white font-bold tracking-wide text-sm">{ann.username || 'Announcement'}</h2>
              </div>
              
              <div className="flex flex-col justify-between gap-4 flex-grow">
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                    {ann.message}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-auto">
                  {currentUserId === ann.ownerId ? (
                    <>
                      <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 cursor-default" title="Total Responses">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-400">
                          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                        </svg>
                        {ann.responseCount || 0} Responses
                      </div>
                      <Link href="/announcement" className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1">
                        OPEN
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </>
                  ) : (
                    <>
                      {ann.phone && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenWhatsApp(ann.phone); }}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 transition-all group"
                          title="Chat on WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-400">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z"/>
                          </svg>
                          {ann.phone}
                        </button>
                      )}
                      <button 
                        onClick={() => { setCurrentIndex(index); setShowModal(true); }}
                        className="text-xs font-bold text-green-400 hover:text-green-300 border border-green-500/50 hover:border-green-400 px-3 py-1 rounded transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                        QUICK REPLY
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative border-l-4 border-green-500 pl-4 py-6 flex flex-col justify-center rounded-r-xl transition-colors duration-1000 ease-out ${currentColor}`}
    >
      {announcements.length > 1 && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
              setIsExpanded(false);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded"
            title="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev + 1) % announcements.length);
              setIsExpanded(false);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded"
            title="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div key={currentIndex} className="animate-in slide-in-from-bottom-5 fade-in duration-300 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-cyan-500/50 shrink-0">
              <Avatar 
                url={avatarUrl} 
                alt={username || 'Announcement'}
                fallback={<span className="text-xs font-bold text-white">{(username || 'A').charAt(0).toUpperCase()}</span>}
                imageClassName="w-full h-full object-cover"
                emojiClassName="text-lg leading-none"
              />
            </div>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-gray-800 bg-green-500" />
          </div>
          <h2 className="text-white font-bold tracking-wide text-sm">{username || 'Announcement'}</h2>
        </div>
        
        {message ? (
          <div className="flex flex-col justify-between gap-4">
            <div>
              <p className="text-white-300 leading-relaxed">
                {isExpanded || !shouldTruncate ? message : `${message.slice(0, MAX_LENGTH)}...`}
              </p>
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-400 hover:text-blue-300 text-xs font-bold mt-2 uppercase tracking-wide"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {currentUserId === ownerId ? (
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 cursor-default" title="Total Responses">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-400">
                    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                  </svg>
                  {responseCount || 0} Responses
                </div>
              ) : (
                <>
                  {phone && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenWhatsApp(phone); }}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 transition-all group"
                      title="Chat on WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-400">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z"/>
                      </svg>
                      {phone}
                    </button>
                  )}

                  <button 
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-green-400 hover:text-green-300 border border-green-500/50 hover:border-green-400 px-3 py-1 rounded transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                    QUICK REPLY
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-gray-400 text-sm">No active announcements.</p>
            <Link href="/announcement" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition-colors text-sm tracking-wider">
              MAKE ANNOUNCEMENT
            </Link>
          </div>
        )}
      </div>
    </section>
    )}

    <ChatModal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        setSentMessages([]);
      }}
      user={{
        username: username || 'Announcer',
        avatarUrl: avatarUrl || null,
      }}
      messages={message && id && ownerId ? [
        {
          id: id,
          content: message,
          created_at: created_at || new Date().toISOString(),
          user_id: ownerId,
          seen: true,
          profiles_table: {
            username: username || 'Announcer',
            avatar_url: avatarUrl || null,
            role: null
          }
        },
        ...(sentMessages.length === 0 ? [
          {
            id: `${id}-system`,
            content: 'This is announcement, reply if you know the answer, interested or needs more information',
            created_at: created_at ? new Date(new Date(created_at).getTime() + 1000).toISOString() : new Date().toISOString(),
            user_id: 'system',
            seen: true,
            profiles_table: {
              username: 'System',
              avatar_url: null,
              role: 'system'
            }
          }
        ] : []),
        ...sentMessages
      ] : []}
      currentUserId={currentUserId || ''}
      onSendMessage={handleSubmitResponse}
    />
    </>
  );
}